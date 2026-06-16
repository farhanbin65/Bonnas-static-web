import os
import json
import re
import random
import time
import feedparser
import requests
from datetime import datetime, timezone
from groq import Groq

GROQ_API_KEY        = os.environ["GROQ_API_KEY"]
SANITY_WRITE_TOKEN  = os.environ["SANITY_WRITE_TOKEN"]

VITE_SANITY_PROJECT_ID = "u5i02ojt"
VITE_SANITY_DATASET    = "production"

KEYWORDS_FILE = "scripts/keywords.json"

RSS_FEEDS = [
    "https://trends.google.com/trends/trendingsearches/daily/rss?geo=GB",
    "https://www.reddit.com/r/UKFood/.rss",
    "https://feeds.bbci.co.uk/food/rss.xml",
]

# ---------------------------------------------------------------
# 1. TARGET KEYWORD SELECTION
# ---------------------------------------------------------------
def get_target_keyword():
    with open(KEYWORDS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    unused = [k for k in data["keyword_bank"] if not k.get("used", False)]

    if not unused:
        print("All keywords used — resetting bank")
        for k in data["keyword_bank"]:
            k["used"] = False
        unused = data["keyword_bank"]

    target = random.choice(unused)

    for k in data["keyword_bank"]:
        if k["keyword"] == target["keyword"]:
            k["used"] = True

    with open(KEYWORDS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Target keyword: {target['keyword']} ({target['intent']})")
    return target

# ---------------------------------------------------------------
# 2. TREND HEADLINES (inspiration only)
# ---------------------------------------------------------------
def fetch_headlines():
    headlines = []
    for url in RSS_FEEDS:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:5]:
                title = entry.get("title", "").strip()
                if title:
                    headlines.append(title)
        except Exception as e:
            print(f"Feed error {url}: {e}")
    print(f"Fetched {len(headlines)} headlines")
    return headlines[:15]

# ---------------------------------------------------------------
# 3. GENERATE POST (with retries)
# ---------------------------------------------------------------
def generate_post(headlines, target, max_attempts=3):
    client = Groq(api_key=GROQ_API_KEY)
    topics = "\n".join(["- " + h for h in headlines])

    intent_guidance = {
        "informational": "Write an educational guide that genuinely teaches the reader. Answer the question fully. Soft-sell Bonna's only at the end.",
        "commercial":    "Write a helpful comparison/decision guide for someone researching this service. Build trust with practical details. Position Bonna's as the natural choice without being pushy.",
        "transactional": "Write for someone ready to order. Be practical: how it works, what's available, delivery areas, how to place an order with Bonna's.",
        "local":         "Write with strong London focus. Mention specific areas naturally (East London, Tower Hamlets, Bethnal Green, Whitechapel).",
    }

    listicle_triggers = ["dishes to try", "ideas", "tips", "best", "must-try", "ways to", "things to"]
    is_listicle = any(trigger in target["keyword"].lower() for trigger in listicle_triggers)

    if is_listicle:
        structure_instruction = (
            'Structure this as a numbered list. Write 2-3 sentences of intro first, '
            'then 5-7 numbered items in the format "N. ItemName: 1-2 sentence description.", '
            'each item separated by the paragraph break marker [PARA]. '
            'After the list, write a short closing section with 2-3 sentences plus an inline FAQ, '
            'separated from the list by [PARA].'
        )
    else:
        structure_instruction = (
            'Structure this as 5-7 short paragraphs, each 2-4 sentences, separated by the '
            'paragraph break marker [PARA]. The last paragraph should include a short inline FAQ '
            'and a soft call to action.'
        )

    prompt = f"""You are an SEO content writer for Bonna's — an authentic Bangladeshi home catering service based in London E2. All food is halal and homemade.

PRIMARY TARGET KEYWORD: "{target['keyword']}"
SEARCH INTENT: {target['intent']}
INTENT GUIDANCE: {intent_guidance.get(target['intent'], intent_guidance['informational'])}

Today's trending UK food topics (INSPIRATION ONLY — use if relevant, otherwise ignore):
{topics}

Return a JSON object with these exact fields:
- "title": SEO title containing the target keyword near the start, max 60 characters, written like a real search result (not poetic)
- "excerpt": meta description, 150-160 characters, contains the target keyword
- "body": the full blog post as plain text, 600-900 words. Use the target keyword in the first 100 words and 3-5 times total, naturally. Mention London and East London areas where natural. Warm, personal tone from Bonna's perspective. {structure_instruction} Do NOT use markdown, asterisks, hash symbols, or real line breaks — use the literal text "[PARA]" as the only separator between paragraphs/items.
- "keywords": array of 4 strings, first one must be exactly "{target['keyword']}", followed by 3 close search variations
- "trendSource": the trending topic used as inspiration, or "evergreen" if none fit

IMPORTANT: Output must be valid JSON. The "body" field must be a single-line string with no real line breaks — use "[PARA]" wherever a paragraph or list item break should go."""

    last_error = None
    for attempt in range(1, max_attempts + 1):
        print(f"Groq attempt {attempt}/{max_attempts}...")
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.6,
                max_tokens=2500,
                response_format={"type": "json_object"},
            )

            raw = response.choices[0].message.content.strip()
            raw = re.sub(r"```json|```", "", raw).strip()

            data = json.loads(raw, strict=False)

            required = ["title", "excerpt", "body", "keywords"]
            for field in required:
                if not data.get(field):
                    raise ValueError(f"Missing or empty field: {field}")

            return data

        except (json.JSONDecodeError, ValueError) as e:
            last_error = e
            print(f"Attempt {attempt} failed: {e}")
            time.sleep(2)
        except Exception as e:
            last_error = e
            print(f"Attempt {attempt} failed (API error): {e}")
            time.sleep(2)

    raise RuntimeError(f"All {max_attempts} attempts failed. Last error: {last_error}")

# ---------------------------------------------------------------
# 4. BODY FORMATTING
# ---------------------------------------------------------------
def format_body(body):
    """Convert [PARA] markers into real paragraph breaks. Falls back to
    sentence-chunking if the model didn't use the marker."""

    if "[PARA]" in body:
        parts = [p.strip() for p in body.split("[PARA]") if p.strip()]
        return "\n\n".join(parts)

    # Fallback: no markers found, chunk every 3 sentences
    text = body.strip()
    sentences = re.split(r'(?<=[.!?])\s+', text)
    paragraphs = []
    chunk = []
    for sentence in sentences:
        chunk.append(sentence)
        if len(chunk) >= 3:
            paragraphs.append(" ".join(chunk))
            chunk = []
    if chunk:
        paragraphs.append(" ".join(chunk))

    return "\n\n".join(paragraphs)

# ---------------------------------------------------------------
# 5. SLUG + SANITY
# ---------------------------------------------------------------
def slugify(title):
    slug = title.lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"\s+", "-", slug).strip("-")
    return slug[:80]

def post_to_sanity(data, target):
    doc = {
        "_type":       "blogPost",
        "title":       data["title"],
        "slug":        { "_type": "slug", "current": slugify(data["title"]) },
        "excerpt":     data["excerpt"],
        "body":        data["body"],
        "keywords":    data["keywords"],
        "trendSource": data.get("trendSource", ""),
        "publishedAt": datetime.now(timezone.utc).isoformat(),
    }

    url = f"https://{VITE_SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/{VITE_SANITY_DATASET}"

    res = requests.post(
        url,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {SANITY_WRITE_TOKEN}",
        },
        json={"mutations": [{"create": doc}]},
    )

    if res.status_code == 200:
        print(f"Posted: {data['title']}")
    else:
        print(f"Failed: {res.text}")
        res.raise_for_status()

# ---------------------------------------------------------------
if __name__ == "__main__":
    print("Selecting target keyword...")
    target = get_target_keyword()

    print("Fetching headlines...")
    headlines = fetch_headlines()

    print("Generating post with Groq...")
    post_data = generate_post(headlines, target)
    print(f"Title: {post_data['title']}")

    print("Formatting body...")
    post_data["body"] = format_body(post_data["body"])

    print("Saving to Sanity...")
    post_to_sanity(post_data, target)
    print("Done!")