import os
import json
import re
import random
import feedparser
import requests
from datetime import datetime, timezone
from groq import Groq

GROQ_API_KEY           = os.environ["GROQ_API_KEY"]
VITE_SANITY_PROJECT_ID = os.environ.get("SANITY_PROJECT_ID", "MISSING")
print(f"Project ID: {VITE_SANITY_PROJECT_ID}")
VITE_SANITY_DATASET = "production"
SANITY_WRITE_TOKEN     = os.environ["SANITY_WRITE_TOKEN"]

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
    """Pick an unused keyword from the bank. Reset when all used."""
    with open(KEYWORDS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    unused = [k for k in data["keyword_bank"] if not k.get("used", False)]

    # All keywords used — reset the cycle
    if not unused:
        print("All keywords used — resetting bank")
        for k in data["keyword_bank"]:
            k["used"] = False
        unused = data["keyword_bank"]

    target = random.choice(unused)

    # Mark as used and persist
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
# 3. GENERATE POST
# ---------------------------------------------------------------
def generate_post(headlines, target):
    client = Groq(api_key=GROQ_API_KEY)
    topics = "\n".join(["- " + h for h in headlines])

    intent_guidance = {
        "informational": "Write an educational guide that genuinely teaches the reader. Answer the question fully. Soft-sell Bonna's only at the end.",
        "commercial":    "Write a helpful comparison/decision guide for someone researching this service. Build trust with practical details (what to expect, questions to ask, rough considerations). Position Bonna's as the natural choice without being pushy.",
        "transactional": "Write for someone ready to order. Be practical: how it works, what's available, delivery areas, how to place an order with Bonna's.",
        "local":         "Write with strong London focus. Mention specific areas naturally (East London, Tower Hamlets, Bethnal Green, Whitechapel). Help a local reader find what they need nearby.",
    }

    prompt = f"""You are an SEO content writer for Bonna's — an authentic Bangladeshi home catering service based in London E2. All food is halal and homemade.

PRIMARY TARGET KEYWORD: "{target['keyword']}"
SEARCH INTENT: {target['intent']}
INTENT GUIDANCE: {intent_guidance.get(target['intent'], intent_guidance['informational'])}

Today's trending UK food topics (INSPIRATION ONLY — connect to one if natural, ignore if not relevant):
{topics}

STRICT RULES:

1. TITLE:
   - Must contain the exact target keyword (or a very close natural variation) near the beginning
   - Write like a real Google search result, NOT poetry
   - GOOD: "Halal Catering in London: What to Expect and How to Order"
   - BAD: "Savoring the Flavors of Bengal"
   - Max 60 characters if possible

2. EXCERPT (meta description):
   - 150-160 characters
   - Must contain the target keyword
   - Must make someone want to click

3. BODY:
   - 700-1000 words
   - Use the exact target keyword in the FIRST 100 words
   - Use the target keyword 3-5 times total across the post — never stuff
   - Include 4-6 subheadings written as plain text lines ending with a colon (no markdown #)
   - At least 2 subheadings should contain a natural variation of the keyword
   - End with a short FAQ section: 3 questions real customers would type into Google, each with a 2-3 sentence answer
   - Mention "London" naturally; reference East London areas where it fits
   - Warm, personal, written from Bonna's perspective
   - Finish with a soft call to action: order online at Bonna's
   - Do NOT use markdown formatting in the body
   - Do NOT copy anything from the trending topics

4. KEYWORDS ARRAY:
   - First item must be the exact target keyword
   - Then 3 close variations someone might actually search

Return ONLY a raw JSON object, no backticks, no markdown:
{{
  "title": "post title here",
  "excerpt": "meta description here",
  "body": "full blog post text here",
  "keywords": ["{target['keyword']}", "variation2", "variation3", "variation4"],
  "trendSource": "trending topic used as inspiration, or 'evergreen' if none"
}}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=2500,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"```json|```", "", raw).strip()

    try:
        return json.loads(raw, strict=False)
    except json.JSONDecodeError as e:
        print(f"JSON parse failed: {e}")
        print(f"Raw response:\n{raw}")
        raise

# ---------------------------------------------------------------
# 4. SLUG + SANITY
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

    print("Saving to Sanity...")
    post_to_sanity(post_data, target)
    print("Done!")