import os
import json
import re
import random
import time
import requests
import feedparser
from datetime import datetime, timezone, date
from groq import Groq

GROQ_API_KEY           = os.environ["GROQ_API_KEY"]
SANITY_WRITE_TOKEN     = os.environ["SANITY_WRITE_TOKEN"]
UNSPLASH_ACCESS_KEY    = os.environ.get("UNSPLASH_ACCESS_KEY", "")
PEXELS_API_KEY         = os.environ.get("PEXELS_API_KEY", "")

VITE_SANITY_PROJECT_ID = "u5i02ojt"
VITE_SANITY_DATASET    = "production"

TOPICS_FILE   = "scripts/topics.json"
IMAGES_FILE   = "scripts/images.json"
CALENDAR_FILE = "scripts/calendar.json"

RSS_FEEDS = [
    "https://trends.google.com/trends/trendingsearches/daily/rss?geo=GB",
    "https://www.reddit.com/r/UKFood/.rss",
    "https://feeds.bbci.co.uk/food/rss.xml",
]

# Content type rotation order
CONTENT_ROTATION = [
    "recipes",
    "restaurant_seo",
    "listicles",
    "local_restaurant",
    "deep_dives",
    "guides",
    "history",
    "stories",
    "local",
]

# ---------------------------------------------------------------
# 1. CALENDAR — check if a seasonal event is coming up
# ---------------------------------------------------------------
def get_seasonal_context():
    """Returns (season_key, hook) if a seasonal event publish window
    is active today, otherwise returns (None, None)."""
    with open(CALENDAR_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    today = date.today()

    for event in data["events"]:
        event_date = date.fromisoformat(event["start"])
        days_until = (event_date - today).days
        window = event.get("publish_window_days_before", 14)

        if 0 <= days_until <= window:
            print(f"Seasonal event active: {event['name']} ({days_until} days away)")
            return event["season_key"], event.get("hook", "")

    return None, None


# ---------------------------------------------------------------
# 2. TOPIC SELECTION — rotation + seasonal priority
# ---------------------------------------------------------------
def get_target_topic(season_key=None):
    """Pick a topic from topics.json. If a season is active, prioritise
    topics matching that season. Otherwise rotate through content types."""
    with open(TOPICS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    # If seasonal event is active, prioritise matching topics
    if season_key:
        seasonal_topics = []
        for content_type, topics in data.items():
            for topic in topics:
                if topic.get("season") == season_key and not topic.get("used", False):
                    seasonal_topics.append((content_type, topic))

        if seasonal_topics:
            content_type, topic = random.choice(seasonal_topics)
            print(f"Seasonal topic selected [{content_type}]: {topic['title']}")
            _mark_topic_used(data, content_type, topic["title"])
            return content_type, topic

    # Otherwise rotate through content types
    # Pick content type based on day of week to enforce variety
    day_index = date.today().weekday()  # 0=Mon, 2=Wed, 4=Fri (your cron days)
    rotation_index = day_index % len(CONTENT_ROTATION)
    preferred_type = CONTENT_ROTATION[rotation_index]

    # Try preferred type first, then fall back to any unused topic
    for content_type in [preferred_type] + CONTENT_ROTATION:
        if content_type not in data:
            continue
        unused = [t for t in data[content_type] if not t.get("used", False)]
        if unused:
            topic = random.choice(unused)
            print(f"Topic selected [{content_type}]: {topic['title']}")
            _mark_topic_used(data, content_type, topic["title"])
            return content_type, topic

    # All topics used — reset everything
    print("All topics used — resetting topic bank")
    for content_type, topics in data.items():
        for topic in topics:
            topic["used"] = False

    with open(TOPICS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    return get_target_topic(season_key)


def _mark_topic_used(data, content_type, title):
    for topic in data[content_type]:
        if topic["title"] == title:
            topic["used"] = True
    with open(TOPICS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


# ---------------------------------------------------------------
# 3. IMAGE RESOLUTION — local DB first, then Unsplash/Pexels
# ---------------------------------------------------------------
def get_image(topic, content_type):
    """Find the best matching image. Checks local DB first,
    then falls back to Unsplash, then Pexels."""

    with open(IMAGES_FILE, "r", encoding="utf-8") as f:
        image_data = json.load(f)

    # Build search terms from topic keywords + title words
    topic_keywords = topic.get("keywords", [])
    title_words = topic["title"].lower().split()
    search_terms = set(topic_keywords + title_words)

    # Score each local image by how many tags match
    best_image = None
    best_score = 0

    for img in image_data.get("local_images", []):
        img_tags = [t.lower() for t in img.get("tags", [])]
        score = sum(1 for term in search_terms if any(term in tag for tag in img_tags))
        if score > best_score:
            best_score = score
            best_image = img

    if best_image and best_score > 0:
        print(f"Local image matched (score {best_score}): {best_image['path']}")
        return {
            "url": f"https://www.bonnas.co.uk{best_image['path']}",
            "alt": best_image["alt"],
            "source": "local"
        }

    # Fallback — Unsplash
    search_query = topic_keywords[0] if topic_keywords else "bangladeshi food"
    if UNSPLASH_ACCESS_KEY:
        try:
            res = requests.get(
                "https://api.unsplash.com/search/photos",
                params={"query": search_query, "per_page": 5, "orientation": "landscape"},
                headers={"Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"},
                timeout=10,
            )
            results = res.json().get("results", [])
            if results:
                photo = random.choice(results[:3])
                print(f"Unsplash image found: {photo['urls']['regular']}")
                return {
                    "url": photo["urls"]["regular"],
                    "alt": photo.get("alt_description") or search_query,
                    "source": "unsplash"
                }
        except Exception as e:
            print(f"Unsplash error: {e}")

    # Fallback — Pexels
    if PEXELS_API_KEY:
        try:
            res = requests.get(
                "https://api.pexels.com/v1/search",
                params={"query": search_query, "per_page": 5, "orientation": "landscape"},
                headers={"Authorization": PEXELS_API_KEY},
                timeout=10,
            )
            results = res.json().get("photos", [])
            if results:
                photo = random.choice(results[:3])
                print(f"Pexels image found: {photo['src']['large']}")
                return {
                    "url": photo["src"]["large"],
                    "alt": photo.get("alt") or search_query,
                    "source": "pexels"
                }
        except Exception as e:
            print(f"Pexels error: {e}")

    print("No image found — using None")
    return None


# ---------------------------------------------------------------
# 4. TREND HEADLINES — inspiration hook only
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
# 5. GENERATE POST
# ---------------------------------------------------------------
def generate_post(headlines, topic, content_type, season_hook="", max_attempts=3):
    client = Groq(api_key=GROQ_API_KEY)
    topics_str = "\n".join(["- " + h for h in headlines])
    primary_keyword = topic["keywords"][0] if topic["keywords"] else topic["title"]

    content_type_guidance = {
        "recipes": "Write a practical, step-by-step recipe guide. Include ingredients naturally in the prose, method overview, and serving suggestions. Warm kitchen tone — like a family member sharing a recipe.",
        "history": "Write an engaging cultural history piece. Educate the reader about origins, traditions, and cultural significance. Reference Bangladesh, Bengal, East London where natural. Build authority and trust.",
        "stories": "Write a warm brand story from Bonna's perspective. Personal, genuine, community-focused. This is about who we are, not just what we sell.",
        "guides": "Write a practical decision/planning guide for someone researching this topic. Answer the real questions they have. Position Bonna's as the expert and natural choice at the end.",
        "local": "Write with a strong East London/London focus throughout. Mention specific areas (Tower Hamlets, Bethnal Green, Whitechapel, Hackney) naturally. Help local readers find what they need.",
        "restaurant_seo": "Write an honest comparison or guide about Bengali/Bangladeshi food options in London. Acknowledge restaurants exist but highlight the unique advantages of home catering. Never dishonest — just clear about what makes Bonna's different.",
        "local_restaurant": "Write a local food guide for a specific London area. Be genuinely helpful about the food scene. Position Bonna's home catering as a premium, personal alternative.",
        "listicles": "Write a numbered list article. Engaging intro, then clear numbered items each with a heading and 2-3 sentences. End with a strong summary and soft call to action.",
        "deep_dives": "Write an in-depth explainer about one specific dish, ingredient, or technique. Teach the reader something they genuinely didn't know. Be the most informative article on this topic.",
    }

    listicle_types = ["listicles"]
    is_listicle = content_type in listicle_types or any(
        trigger in primary_keyword.lower()
        for trigger in ["dishes to try", "ideas", "tips", "best", "must-try", "ways to", "things to", "reasons"]
    )

    if is_listicle:
        structure_instruction = (
            'Structure as a numbered list: 2-3 sentence intro, then 5-8 numbered items '
            'in format "N. Item Name: 1-2 sentence description.", each separated by [PARA]. '
            'After the list, write a 2-3 sentence closing with a soft call to action, separated by [PARA].'
        )
    else:
        structure_instruction = (
            'Structure as 5-7 short paragraphs, each 2-4 sentences, separated by [PARA]. '
            'Last paragraph: brief inline FAQ (2-3 questions woven into prose) plus soft call to action.'
        )

    season_hook_instruction = ""
    if season_hook:
        season_hook_instruction = f'\nSEASONAL HOOK — open the post with this context naturally: "{season_hook}"'

    prompt = f"""You are an SEO content writer for Bonna's — an authentic Bangladeshi home catering service based in London E2. All food is halal and homemade.

CONTENT TYPE: {content_type}
CONTENT GUIDANCE: {content_type_guidance.get(content_type, content_type_guidance['guides'])}

POST TITLE (use this as the basis): "{topic['title']}"
PRIMARY TARGET KEYWORD: "{primary_keyword}"
SECONDARY KEYWORDS: {json.dumps(topic['keywords'][1:] if len(topic['keywords']) > 1 else [])}
{season_hook_instruction}

Today's trending UK food topics (INSPIRATION ONLY — weave in as a hook if genuinely relevant, otherwise ignore):
{topics_str}

Return a JSON object with these exact fields:
- "title": SEO title based on the post title above, max 65 characters, written like a real search result. Must contain the primary keyword naturally.
- "excerpt": meta description 150-160 characters, contains primary keyword, makes reader want to click
- "body": full blog post, 700-1000 words. Primary keyword in first 100 words and 3-5 times total. {structure_instruction} Use [PARA] as the ONLY separator — no real line breaks, no markdown, no asterisks.
- "keywords": array of 4 strings — first must be exactly "{primary_keyword}", then 3 natural search variations
- "trendSource": the trending topic used as hook, or "evergreen" if none used
- "contentType": "{content_type}"

CRITICAL: Valid JSON only. Body must be a single-line string. Use [PARA] for all breaks."""

    last_error = None
    for attempt in range(1, max_attempts + 1):
        print(f"Groq attempt {attempt}/{max_attempts}...")
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.65,
                max_tokens=2800,
                response_format={"type": "json_object"},
            )

            raw = response.choices[0].message.content.strip()
            raw = re.sub(r"```json|```", "", raw).strip()
            data = json.loads(raw, strict=False)

            for field in ["title", "excerpt", "body", "keywords"]:
                if not data.get(field):
                    raise ValueError(f"Missing field: {field}")

            return data

        except (json.JSONDecodeError, ValueError) as e:
            last_error = e
            print(f"Attempt {attempt} failed: {e}")
            time.sleep(2)
        except Exception as e:
            last_error = e
            print(f"Attempt {attempt} failed (API error): {e}")
            time.sleep(2)

    raise RuntimeError(f"All {max_attempts} attempts failed. Last: {last_error}")


# ---------------------------------------------------------------
# 6. BODY FORMATTING
# ---------------------------------------------------------------
def format_body(body):
    if "[PARA]" in body:
        parts = [p.strip() for p in body.split("[PARA]") if p.strip()]
        return "\n\n".join(parts)

    # Fallback: chunk every 3 sentences
    sentences = re.split(r'(?<=[.!?])\s+', body.strip())
    paragraphs, chunk = [], []
    for sentence in sentences:
        chunk.append(sentence)
        if len(chunk) >= 3:
            paragraphs.append(" ".join(chunk))
            chunk = []
    if chunk:
        paragraphs.append(" ".join(chunk))
    return "\n\n".join(paragraphs)


# ---------------------------------------------------------------
# 7. SLUG
# ---------------------------------------------------------------
def slugify(title):
    slug = title.lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"\s+", "-", slug).strip("-")
    return slug[:80]


# ---------------------------------------------------------------
# 8. POST TO SANITY
# ---------------------------------------------------------------
def post_to_sanity(data, image):
    doc = {
        "_type":        "blogPost",
        "title":        data["title"],
        "slug":         {"_type": "slug", "current": slugify(data["title"])},
        "excerpt":      data["excerpt"],
        "body":         data["body"],
        "keywords":     data["keywords"],
        "trendSource":  data.get("trendSource", "evergreen"),
        "contentType":  data.get("contentType", ""),
        "publishedAt":  datetime.now(timezone.utc).isoformat(),
    }

    # Add image if resolved
    if image:
        doc["featuredImageUrl"] = image["url"]
        doc["featuredImageAlt"] = image["alt"]
        doc["imageSource"]      = image["source"]

    url = f"https://{VITE_SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/{VITE_SANITY_DATASET}"

    res = requests.post(
        url,
        headers={
            "Content-Type":  "application/json",
            "Authorization": f"Bearer {SANITY_WRITE_TOKEN}",
        },
        json={"mutations": [{"create": doc}]},
    )

    if res.status_code == 200:
        print(f"Posted: {data['title']}")
    else:
        print(f"Sanity error: {res.text}")
        res.raise_for_status()


# ---------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------
if __name__ == "__main__":
    print("Checking seasonal calendar...")
    season_key, season_hook = get_seasonal_context()

    print("Selecting topic...")
    content_type, topic = get_target_topic(season_key)

    print("Resolving image...")
    image = get_image(topic, content_type)

    print("Fetching trend headlines...")
    headlines = fetch_headlines()

    print("Generating post with Groq...")
    post_data = generate_post(headlines, topic, content_type, season_hook)
    print(f"Title: {post_data['title']}")

    print("Formatting body...")
    post_data["body"] = format_body(post_data["body"])

    print("Saving to Sanity...")
    post_to_sanity(post_data, image)
    print("Done!")