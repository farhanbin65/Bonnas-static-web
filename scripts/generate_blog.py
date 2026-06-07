import os
import json
import re
import feedparser
import requests
from datetime import datetime
from groq import Groq

GROQ_API_KEY      = os.environ["GROQ_API_KEY"]
SANITY_PROJECT_ID = os.environ["SANITY_PROJECT_ID"]
SANITY_DATASET    = os.environ.get("SANITY_DATASET", "production")
SANITY_WRITE_TOKEN= os.environ["SANITY_WRITE_TOKEN"]

RSS_FEEDS = [
    "https://trends.google.com/trends/trendingsearches/daily/rss?geo=GB",
    "https://www.reddit.com/r/UKFood/.rss",
    "https://feeds.bbci.co.uk/food/rss.xml",
]

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

def generate_post(headlines):
    client = Groq(api_key=GROQ_API_KEY)
    topics = "\n".join(["- " + h for h in headlines])

    prompt = f"""You are a content writer for Bonna's — an authentic Bangladeshi home catering service based in London E2.

Today's trending UK food topics:
{topics}

Task:
1. Pick the most relevant trending topic that connects to Bangladeshi food, South Asian cuisine, London food scene, catering, or home cooking
2. Write a completely original SEO blog post for Bonna's website

Rules:
- 400 to 600 words
- Warm and personal tone — written from Bonna's perspective
- Naturally mention Bonna's catering services
- Target keywords: Bangladeshi catering London, home cooked food London, Bengali food
- Do NOT copy or paraphrase anything from the trending topics — use them only as inspiration for the subject
- Do NOT use markdown formatting in the body

Return ONLY a raw JSON object with these exact fields, no backticks, no markdown:
{{
  "title": "post title here",
  "excerpt": "two sentence SEO meta description here",
  "body": "full blog post text here",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
  "trendSource": "the trending topic that inspired this post"
}}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=2000,
    )

    raw = response.choices[0].message.content.strip()

    # strip any accidental backticks
    raw = re.sub(r"```json|```", "", raw).strip()

    return json.loads(raw)

def slugify(title):
    slug = title.lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"\s+", "-", slug).strip("-")
    return slug[:80]

def post_to_sanity(data):
    doc = {
        "_type":       "blogPost",
        "title":       data["title"],
        "slug":        { "_type": "slug", "current": slugify(data["title"]) },
        "excerpt":     data["excerpt"],
        "body":        data["body"],
        "keywords":    data["keywords"],
        "trendSource": data.get("trendSource", ""),
        "publishedAt": datetime.utcnow().isoformat() + "Z",
    }

    url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/{SANITY_DATASET}"

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

if __name__ == "__main__":
    print("Fetching headlines...")
    headlines = fetch_headlines()

    print("Generating post with Groq...")
    post_data = generate_post(headlines)
    print(f"Title: {post_data['title']}")

    print("Saving to Sanity...")
    post_to_sanity(post_data)
    print("Done!")