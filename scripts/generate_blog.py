import os
import sys
import json
import re
import random
import time
import requests
import feedparser
from datetime import datetime, timezone, date
from groq import Groq

# ---------------------------------------------------------------
# CONFIG
# Test locally:  python scripts/generate_blog.py --dry-run
# Test a date:   python scripts/generate_blog.py --dry-run --date 2027-01-25
# ---------------------------------------------------------------
NO_LLM = "--no-llm" in sys.argv
DRY_RUN = "--dry-run" in sys.argv or NO_LLM
TODAY = date.today()
if "--date" in sys.argv:
    TODAY = date.fromisoformat(sys.argv[sys.argv.index("--date") + 1])

GROQ_API_KEY        = os.environ.get("GROQ_API_KEY", "")
SANITY_WRITE_TOKEN  = os.environ.get("SANITY_WRITE_TOKEN", "")
UNSPLASH_ACCESS_KEY = os.environ.get("UNSPLASH_ACCESS_KEY", "")
PEXELS_API_KEY      = os.environ.get("PEXELS_API_KEY", "")

VITE_SANITY_PROJECT_ID = "u5i02ojt"
VITE_SANITY_DATASET    = "production"

TOPICS_FILE   = "scripts/topics.json"
IMAGES_FILE   = "scripts/images.json"
CALENDAR_FILE = "scripts/calendar.json"
KEYWORDS_FILE = "scripts/keywords.json"
INDEX_FILE    = "scripts/post_index.json"

RSS_FEEDS = [
    "https://trends.google.com/trends/trendingsearches/daily/rss?geo=GB",
    "https://www.reddit.com/r/UKFood/.rss",
    "https://feeds.bbci.co.uk/food/rss.xml",
]
USE_TRENDS = False  # feeds currently return noise, set True to re-enable

CONTENT_ROTATION = [
    "recipes", "restaurant_seo", "listicles", "local_restaurant", "deep_dives",
    "guides", "history", "stories", "local",
]

INTENT_BY_TYPE = {
    "guides": "commercial", "local": "commercial", "local_restaurant": "commercial",
    "restaurant_seo": "commercial", "listicles": "informational", "recipes": "informational",
    "deep_dives": "informational", "history": "informational", "stories": None,
}

BUSINESS_FACTS = """BUSINESS FACTS (always true, never contradict them):
- Bonna's is a home cooked Bangladeshi food and catering kitchen in London E2. Customers collect from E2 0RB.
- COLLECTION ONLY. There is NO delivery. Never write that food is delivered and never offer delivery.
- Pre-order only, with at least 2 days notice. Everything is cooked fresh to order.
- 100 percent halal.
- Caters for all events, small and large: weddings, aqiqah, walima, gaye holud, milad, Eid, iftar, birthdays, office lunches.
- Menu includes: Biya Bari platters, polao, chicken roast, korma, dum biriyani, tehari, vorta, fish curries, daal, bhaji, kebabs and chops, chotpoti, fuchka, haleem, pakon pitha, milk egg pudding, shahi jorda, nawabi shemai, rice pudding.
- Customers order at bonnas.co.uk/menu, by WhatsApp, or at orders@bonnas.co.uk.
- Do NOT invent prices, minimum order values, opening hours, distances, travel times, awards, years in business or reviews."""

AREA_ANGLES = {
    "stepney green":   "customers in the area can pre-order and collect from E2 0RB, bethnal green",
    "mile end":        "customers in the area can pre-order and collect from E2 0RB, bethnal green",
    "cambridge heath": "customers in the area can pre-order and collect from E2 0RB, bethnal green",
    "whitechapel":     "customers in the area can pre-order and collect from E2 0RB, bethnal green",
    "roman road":      "the neighbourhood where Bonna's kitchen is based at E2 0RB, bethnal green",
    "bow":             "customers in the area can pre-order and collect from E2 0RB, bethnal green",
    "shoreditch":      "customers in the area can pre-order and collect from E2 0RB, bethnal green",
    "shadwell":        "customers in the area can pre-order and collect from E2 0RB, bethnal green",
    "tower hamlets":   "customers can pre-order and collect from E2 0RB, bethnal green",
    "hackney":         "customers in the area can pre-order and collect from E2 0RB, bethnal green",
    "bethnal green":   "the neighbourhood where Bonna's kitchen is based at E2 0RB, bethnal green",
}

STOPWORDS = set(
    "a an the and or of in on at to for with from by is are was were be your you our we how what "
    "why which who best top ways way guide near london east about into this that it its as vs "
    "food catering".split()
)
VARIANT_MAP = {
    "biriyani": "biryani", "biriani": "biryani", "briyani": "biryani",
    "bhorta": "vorta", "bharta": "vorta", "bhurta": "vorta",
    "phuchka": "fuchka", "puchka": "fuchka",
    "pulao": "polao", "polau": "polao", "halim": "haleem",
    "bangla": "bangladeshi", "bengali": "bangladeshi", "desi": "bangladeshi",
}

# Blocks claims like "we deliver" / "delivered to your door"
DELIVERY_CLAIM = re.compile(
    r"\b(we deliver|delivered to|free delivery|home delivery|doorstep|"
    r"delivery (?:across|to|within)|deliver(?:s|ed|ing)? (?:your|to|across|straight))\b",
    re.I,
)

FALLBACK_DIRECT_ANSWER = {
    "question": "Where can I get authentic halal Bangladeshi food near E2?",
    "answer": "Bonna's cooks fresh, 100 percent halal Bangladeshi food in London E2. Everything is pre-order only with two days notice and collected from E2 0RB. Order at bonnas.co.uk/menu or contact us by WhatsApp or email.",
}
FALLBACK_FAQS = [
    {"question": "Is Bonna's food halal?",
     "answer": "Yes. All food at Bonna's is 100 percent halal and cooked fresh at home in East London using traditional Bangladeshi recipes."},
    {"question": "How do I order from Bonna's?",
     "answer": "Pre-order at bonnas.co.uk/menu, by WhatsApp or at orders@bonnas.co.uk. Please allow at least two days notice so everything can be cooked fresh for you."},
    {"question": "Do you deliver?",
     "answer": "No, Bonna's is collection only. You collect your pre-order from E2 0RB, freshly cooked and ready for you."},
]


# ---------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------
def load_json(path, default=None):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def save_json(path, data):
    if DRY_RUN:
        return
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def _terms(items):
    """Meaningful lowercase words, spelling variants normalised."""
    if isinstance(items, str):
        items = [items]
    out = set()
    for text in items:
        for w in re.findall(r"[a-z]+", text.lower()):
            if len(w) >= 3 and w not in STOPWORDS:
                out.add(VARIANT_MAP.get(w, w))
    return out


def strip_markdown(text):
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"\*(.+?)\*", r"\1", text)
    text = re.sub(r"__(.+?)__", r"\1", text)
    text = re.sub(r"_(.+?)_", r"\1", text)
    return text.strip()


# ---------------------------------------------------------------
# INTERNAL LINKING
# ---------------------------------------------------------------
def get_related_posts(topic, max_results=3):
    posts = load_json(INDEX_FILE, {"posts": []}).get("posts", [])
    if not posts:
        return []
    search_terms = _terms([topic["title"]] + topic.get("keywords", []))
    scored = []
    for post in posts:
        score = len(search_terms & _terms([post.get("title", "")] + post.get("keywords", [])))
        if score >= 2:
            scored.append((score, post))
    scored.sort(key=lambda x: x[0], reverse=True)
    related = [p for _, p in scored[:max_results]]
    print(f"Found {len(related)} related posts for internal linking")
    return related


def update_post_index(title, slug, keywords, content_type):
    data = load_json(INDEX_FILE, {"posts": []})
    if slug in {p["slug"] for p in data["posts"]}:
        print(f"Post already in index: {slug}")
        return
    data["posts"].append({
        "title": title, "slug": slug, "keywords": keywords,
        "contentType": content_type,
        "publishedAt": datetime.now(timezone.utc).isoformat(),
    })
    save_json(INDEX_FILE, data)
    print(f"Post index updated: {title}")


# ---------------------------------------------------------------
# 1. CALENDAR
# ---------------------------------------------------------------
def _event_dates(event):
    if event.get("recurring"):
        m, d = map(int, event["recurring"].split("-"))
        return [date(y, m, d) for y in (TODAY.year - 1, TODAY.year, TODAY.year + 1)]
    return [date.fromisoformat(x) for x in event.get("dates", [])]


def get_active_events():
    """All events whose publish window is open today."""
    data = load_json(CALENDAR_FILE, {"events": []})
    active = []
    for e in data["events"]:
        window = e.get("publish_window_days_before", 14)
        after = e.get("active_days_after_start", 0)
        for d in _event_dates(e):
            days_until = (d - TODAY).days
            if -after <= days_until <= window:
                active.append({
                    "key": e["season_key"], "name": e["name"], "hook": e.get("hook", ""),
                    "year": d.year, "priority": e.get("priority", 3),
                    "chance": e.get("chance", 0.7), "days_until": days_until,
                })
                print(f"Active event: {e['name']} ({days_until} days)")
                break
    return active


def check_calendar_health():
    data = load_json(CALENDAR_FILE, {"events": []})
    for e in data["events"]:
        if e.get("dates") and not any(date.fromisoformat(d) >= TODAY for d in e["dates"]):
            print(f"WARNING: no future date for '{e['name']}' in calendar.json - please update it")


def get_weekly_hook():
    hooks = load_json(CALENDAR_FILE, {}).get("weekly_hooks", {})
    return hooks.get(str(TODAY.weekday()), "")


# ---------------------------------------------------------------
# 2. TOPIC SELECTION
# ---------------------------------------------------------------
def _priority_map():
    bank = load_json(KEYWORDS_FILE, {}).get("keyword_bank", [])
    return {e["keyword"].lower(): e.get("priority", 3) for e in bank}


def _pick(pool, key=lambda x: x):
    """Weighted random pick: topics whose keywords have higher priority win more often."""
    prio = _priority_map()
    def weight(item):
        t = key(item)
        return max([prio.get(k.lower(), 3) for k in t.get("keywords", [])] or [3])
    return random.choices(pool, weights=[weight(i) for i in pool])[0]


def _is_available(topic, event=None):
    if event:
        return topic.get("season") == event["key"] and (
            not topic.get("used", False) or topic.get("used_year", 0) < event["year"]
        )
    return topic.get("season", "all") == "all" and not topic.get("used", False)


def _mark_topic_used(data, content_type, title, year):
    for topic in data[content_type]:
        if topic["title"] == title:
            topic["used"] = True
            topic["used_year"] = year
    save_json(TOPICS_FILE, data)


def get_target_topic(active_events):
    """Returns (content_type, topic, event_or_None)."""
    data = load_json(TOPICS_FILE, {})

    # Seasonal first: weighted by event priority, each event rolls its own chance
    events = list(active_events)
    while events:
        ev = random.choices(events, weights=[e["priority"] for e in events])[0]
        events.remove(ev)
        if random.random() > ev["chance"]:
            continue
        pool = [(ct, t) for ct, ts in data.items() for t in ts if _is_available(t, ev)]
        if pool:
            ct, topic = _pick(pool, key=lambda x: x[1])
            print(f"Seasonal topic [{ct}] for {ev['name']}: {topic['title']}")
            _mark_topic_used(data, ct, topic["title"], ev["year"])
            return ct, topic, ev

    # Evergreen rotation: cycles through every content type by post count
    post_count = len(load_json(INDEX_FILE, {"posts": []}).get("posts", []))
    start = post_count % len(CONTENT_ROTATION)
    for ct in CONTENT_ROTATION[start:] + CONTENT_ROTATION[:start]:
        pool = [t for t in data.get(ct, []) if _is_available(t)]
        if pool:
            topic = _pick(pool)
            print(f"Topic selected [{ct}]: {topic['title']}")
            _mark_topic_used(data, ct, topic["title"], TODAY.year)
            return ct, topic, None

    if DRY_RUN or not any(t.get("season", "all") == "all" for ts in data.values() for t in ts):
        raise RuntimeError("No unused evergreen topics left - add more to topics.json")
    print("All evergreen topics used - resetting them")
    for ts in data.values():
        for t in ts:
            if t.get("season", "all") == "all":
                t["used"] = False
    save_json(TOPICS_FILE, data)
    return get_target_topic(active_events)


# ---------------------------------------------------------------
# 3. KEYWORD CONTEXT (uses keywords.json)
# ---------------------------------------------------------------
def get_keyword_context(topic, content_type=""):
    data = load_json(KEYWORDS_FILE, {})
    bank = data.get("keyword_bank", [])
    variants = data.get("spelling_variants", {})

    primary = (topic["keywords"][0] if topic.get("keywords") else topic["title"]).lower()
    own = {k.lower() for k in topic.get("keywords", [])}
    topic_terms = _terms([topic["title"]] + topic.get("keywords", []))

    intent, scored = None, []
    for e in bank:
        kw = e["keyword"].lower()
        if kw == primary:
            intent = e.get("intent")
        if kw in own:
            continue
        score = len(_terms(kw) & topic_terms)
        if score >= 2:
            scored.append((score, e.get("priority", 3), not e.get("used", False), kw))
    scored.sort(reverse=True)

    intent = intent or INTENT_BY_TYPE.get(content_type)
    text = (topic["title"] + " " + " ".join(topic.get("keywords", []))).lower()
    alts = []
    for std, alt in variants.items():
        others = [a for a in alt if a != std]
        if std in text and others:
            alts.append(f'{std} (also spelled {", ".join(others[:2])})')

    area = next(((a, angle) for a, angle in AREA_ANGLES.items() if a in text), None)

    return {
        "supporting": [s[3] for s in scored[:3]],
        "intent": intent,
        "variants": alts[:3],
        "area": area,
    }


def mark_keyword_used(primary):
    data = load_json(KEYWORDS_FILE, {})
    changed = False
    for e in data.get("keyword_bank", []):
        if e["keyword"].lower() == primary.lower():
            e["used"] = True
            e["last_used"] = TODAY.isoformat()
            changed = True
    if changed:
        save_json(KEYWORDS_FILE, data)


def cta_for_intent(intent):
    if intent == "transactional":
        return "End with a clear, confident call to pre-order at bonnas.co.uk/menu (2 days notice, collection from E2 0RB)."
    if intent == "commercial":
        return "End with a helpful call to action: invite the reader to pre-order or ask about their event at bonnas.co.uk."
    return "End with a soft, non-pushy mention that Bonna's cooks this fresh to order."


# ---------------------------------------------------------------
# 4. IMAGE RESOLUTION
# ---------------------------------------------------------------
def get_image(topic, content_type):
    image_data = load_json(IMAGES_FILE, {})
    topic_keywords = topic.get("keywords", [])
    search_terms = _terms([topic["title"]] + topic_keywords)

    best_image, best_score = None, 0
    for img in image_data.get("local_images", []):
        score = len(search_terms & _terms(img.get("tags", [])))
        if score > best_score:
            best_score, best_image = score, img

    if best_image:
        print(f"Local image matched (score {best_score}): {best_image['path']}")
        return {"url": f"https://www.bonnas.co.uk{best_image['path']}",
                "alt": best_image["alt"], "source": "local"}

    search_query = topic_keywords[0] if topic_keywords else "bangladeshi food"
    if UNSPLASH_ACCESS_KEY:
        try:
            res = requests.get(
                "https://api.unsplash.com/search/photos",
                params={"query": search_query, "per_page": 5, "orientation": "landscape"},
                headers={"Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"}, timeout=10)
            results = res.json().get("results", [])
            if results:
                photo = random.choice(results[:3])
                return {"url": photo["urls"]["regular"],
                        "alt": photo.get("alt_description") or search_query, "source": "unsplash"}
        except Exception as e:
            print(f"Unsplash error: {e}")

    if PEXELS_API_KEY:
        try:
            res = requests.get(
                "https://api.pexels.com/v1/search",
                params={"query": search_query, "per_page": 5, "orientation": "landscape"},
                headers={"Authorization": PEXELS_API_KEY}, timeout=10)
            results = res.json().get("photos", [])
            if results:
                photo = random.choice(results[:3])
                return {"url": photo["src"]["large"],
                        "alt": photo.get("alt") or search_query, "source": "pexels"}
        except Exception as e:
            print(f"Pexels error: {e}")

    print("No image found")
    return None


# ---------------------------------------------------------------
# 5. TREND HEADLINES
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
# 6. GENERATE POST
# ---------------------------------------------------------------
def generate_post(headlines, topic, content_type, season=None, related_posts=None,
                  kw_ctx=None, weekly_hook="", max_attempts=3):

    kw_ctx = kw_ctx or {"supporting": [], "intent": None, "variants": [], "area": None}
    topics_str = "\n".join("- " + h for h in headlines) or "(none today, write an evergreen post)"
    primary_keyword = topic["keywords"][0] if topic.get("keywords") else topic["title"]

    guidance = {
        "recipes": "Write a practical, step-by-step recipe guide. Include ingredients naturally in the prose, method overview, and serving suggestions. Warm kitchen tone, like a family member sharing a recipe.",
        "history": "Write an engaging cultural history piece. Educate the reader about origins, traditions and cultural significance. Reference Bangladesh, Bengal and East London where natural. Build authority and trust.",
        "stories": "Write a warm brand story from Bonna's perspective. Personal, genuine, community-focused. This is about who we are, not just what we sell.",
        "guides": "Write a practical decision or planning guide for someone researching this topic. Answer the real questions they have. Position Bonna's as the expert and natural choice at the end.",
        "local": "Write with a strong East London focus. Mention the specific area in the title naturally and explain that customers pre-order and collect from E2 0RB. Never describe delivery.",
        "restaurant_seo": "Write an honest comparison or guide about Bengali and Bangladeshi food options in London. Acknowledge restaurants and takeaways exist but explain what is different about pre-order home cooking. Never dishonest.",
        "local_restaurant": "Write a local food guide for a specific London area. Be genuinely helpful about the food scene. Position Bonna's as a personal, pre-order, collect-from-E2 alternative. Never describe delivery.",
        "listicles": "Write a numbered list article. Engaging intro, then clear numbered items each with a heading and 2-3 sentences. End with a strong summary and soft call to action.",
        "deep_dives": "Write an in-depth explainer about one specific dish, ingredient or technique. Teach the reader something they genuinely did not know. Be the most informative article on this topic.",
    }

    is_listicle = content_type == "listicles" or any(
        t in primary_keyword.lower()
        for t in ["dishes to try", "ideas", "tips", "best", "must-try", "ways to", "things to", "reasons"]
    )
    if is_listicle:
        structure = ('Structure as a numbered list: 2-3 sentence intro, then 5-8 numbered items in format '
                     '"N. Item Name: 1-2 sentence description.", each separated by [PARA]. '
                     'After the list, write a 2-3 sentence closing with a call to action, separated by [PARA].')
    else:
        structure = ('Structure as 5-7 short paragraphs, each 2-4 sentences, separated by [PARA]. '
                     'The last paragraph is a short closing with the call to action.')

    extras = ""
    if season and season.get("hook"):
        extras += f'\nSEASONAL HOOK: open the post with this context naturally: "{season["hook"]}"'
    if weekly_hook:
        extras += f'\nWEEKLY NOTE: if it fits, use this idea in the closing paragraph in one sentence only: "{weekly_hook}"'
    if kw_ctx["supporting"]:
        extras += f'\nSUPPORTING KEYWORDS: use 1-3 of these naturally where they fit, never stuff: {json.dumps(kw_ctx["supporting"])}'
    if kw_ctx["variants"]:
        extras += f'\nSPELLING: use the main spelling most often, and mention one alternative spelling once naturally: {"; ".join(kw_ctx["variants"])}'
    if kw_ctx["area"]:
        extras += (f'\nAREA FOCUS: {name.title()}. Angle: {angle}. Mention the area naturally 2-3 times. '
            f'Always say "collect from E2 0RB on Roman Road" (that is where the kitchen is). Do not invent landmarks, distances or travel times.')
    extras += "\n" + cta_for_intent(kw_ctx["intent"])

    links = ""
    if related_posts:
        links_list = "\n".join(f'- Title: "{p["title"]}" | Slug: {p["slug"]}' for p in related_posts)
        links = f"""
INTERNAL LINKS: naturally reference 1-2 of these related Bonna's blog posts where genuinely relevant. Use this exact marker format: [LINK: slug-here | Anchor text here]
Example: [LINK: chicken-biryani-recipe | our chicken biryani recipe]
Related posts available:
{links_list}
Only use a link if it fits naturally, never force it."""

    prompt = f"""You are an SEO content writer for Bonna's, a Bangladeshi home cooking and catering kitchen in London E2.

{BUSINESS_FACTS}

CONTENT TYPE: {content_type}
CONTENT GUIDANCE: {guidance.get(content_type, guidance['guides'])}

POST TITLE (use as the basis): "{topic['title']}"
PRIMARY TARGET KEYWORD: "{primary_keyword}"
SECONDARY KEYWORDS: {json.dumps(topic['keywords'][1:] if len(topic.get('keywords', [])) > 1 else [])}
{extras}

Today's trending UK food topics (INSPIRATION ONLY, weave in as a hook only if genuinely relevant):
{topics_str}

Return a JSON object with these exact fields:
- "title": SEO title based on the post title above, max 65 characters, like a real search result. Contains the primary keyword naturally.
- "excerpt": meta description 150-160 characters, contains the primary keyword, makes the reader want to click
- "body": full blog post, 500-700 words. Primary keyword in the first 100 words and 3-5 times in total. {structure} Use [PARA] as the ONLY separator. ABSOLUTELY NO markdown of any kind: no asterisks, no underscores, no hash symbols. Plain prose only.
- "directAnswer": an object with keys "question" and "answer". The question is the main thing a searcher wants to know about this topic. The answer is 40-60 words of plain text that starts with the direct answer.
- "faqs": an array of exactly 3 objects, each with keys "question" and "answer". Real questions people search about this topic. Each answer 30-50 words, plain text. At least one question must be practical (ordering, pre-order notice, collection or halal).
- "keywords": array of 4 strings. The first must be exactly "{primary_keyword}", then 3 natural search variations
- "trendSource": the trending topic used as a hook, or "evergreen" if none used
- "contentType": "{content_type}"
{links}

CRITICAL: Valid JSON only. Body must be a single-line string. Use [PARA] for all breaks. Keep [LINK:...] markers exactly as shown, the frontend converts them to links."""

    if NO_LLM:
        print("\n===== PROMPT THAT WOULD BE SENT =====\n")
        print(prompt)
        sys.exit(0)

    client = Groq(api_key=GROQ_API_KEY)

    last_error = None
    for attempt in range(1, max_attempts + 1):
        print(f"Groq attempt {attempt}/{max_attempts}...")
        try:
            response = client.chat.completions.create(
                model="openai/gpt-oss-20b",
                messages=[
                    {"role": "system", "content": "You are an SEO content writer. Always respond with valid JSON only. No markdown, no explanations, just the JSON object."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.65,
                max_tokens=4000,
                reasoning_effort="low",
            )
            choice = response.choices[0]
            print(f"Finish reason: {choice.finish_reason}")
            raw = (choice.message.content or "").strip()
            raw = re.sub(r"^```json\s*", "", raw)
            raw = re.sub(r"^```\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw).strip()

            data = json.loads(raw, strict=False)

            for field in ["title", "excerpt", "body", "keywords"]:
                if not data.get(field):
                    raise ValueError(f"Missing field: {field}")

            # directAnswer
            da = data.get("directAnswer")
            if isinstance(da, dict) and da.get("question") and da.get("answer"):
                data["directAnswer"] = {"question": strip_markdown(da["question"]),
                                        "answer": strip_markdown(da["answer"])}
            else:
                data["directAnswer"] = FALLBACK_DIRECT_ANSWER
                print("directAnswer missing - using fallback")

            # faqs
            faqs = [
                {"question": strip_markdown(f["question"]), "answer": strip_markdown(f["answer"])}
                for f in (data.get("faqs") or [])
                if isinstance(f, dict) and f.get("question") and f.get("answer")
            ]
            if len(faqs) < 2:
                faqs = FALLBACK_FAQS
                print("faqs missing - using fallback")
            data["faqs"] = faqs[:3]

            # Never allow delivery claims
            all_text = " ".join([data["body"], json.dumps(data["directAnswer"]), json.dumps(data["faqs"])])
            if DELIVERY_CLAIM.search(all_text):
                raise ValueError("Output claims delivery (collection only)")

            if primary_keyword.lower() not in data["body"].lower():
                print(f"Note: primary keyword '{primary_keyword}' not found verbatim in body")

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
# 7. BODY FORMATTING
# ---------------------------------------------------------------
def format_body(body):
    body = strip_markdown(body)

    def validate_link(match):
        content = match.group(1)
        if "|" in content:
            slug, anchor = [p.strip() for p in content.split("|", 1)]
            if slug and anchor:
                return f"[LINK: {slug} | {anchor}]"
        return ""

    body = re.sub(r"\[LINK:\s*([^\]]+)\]", validate_link, body)

    if "[PARA]" in body:
        return "\n\n".join(p.strip() for p in body.split("[PARA]") if p.strip())

    sentences = re.split(r"(?<=[.!?])\s+", body.strip())
    paragraphs, chunk = [], []
    for s in sentences:
        chunk.append(s)
        if len(chunk) >= 3:
            paragraphs.append(" ".join(chunk))
            chunk = []
    if chunk:
        paragraphs.append(" ".join(chunk))
    return "\n\n".join(paragraphs)


# ---------------------------------------------------------------
# 8. SLUG
# ---------------------------------------------------------------
def slugify(title):
    slug = title.lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"\s+", "-", slug).strip("-")
    return slug[:80]


def unique_slug(title):
    base = slugify(title)
    taken = {p["slug"] for p in load_json(INDEX_FILE, {"posts": []}).get("posts", [])}
    slug, n = base, 2
    while slug in taken:
        slug = f"{base[:74]}-{n}"
        n += 1
    return slug


# ---------------------------------------------------------------
# 9. POST TO SANITY
# ---------------------------------------------------------------
def post_to_sanity(data, image, slug):
    if not SANITY_WRITE_TOKEN:
        raise RuntimeError("SANITY_WRITE_TOKEN is not set")

    doc = {
        "_type":        "blogPost",
        "title":        data["title"],
        "slug":         {"_type": "slug", "current": slug},
        "excerpt":      data["excerpt"],
        "body":         data["body"],
        "keywords":     data["keywords"],
        "trendSource":  data.get("trendSource", "evergreen"),
        "contentType":  data.get("contentType", ""),
        "directAnswer": data["directAnswer"],
        "faqs":         [{"_key": f"faq{i}", **f} for i, f in enumerate(data["faqs"])],
        "publishedAt":  datetime.now(timezone.utc).isoformat(),
    }
    if image:
        doc["featuredImageUrl"] = image["url"]
        doc["featuredImageAlt"] = image["alt"]
        doc["imageSource"]      = image["source"]

    url = f"https://{VITE_SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/{VITE_SANITY_DATASET}"
    res = requests.post(
        url,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {SANITY_WRITE_TOKEN}"},
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
    if DRY_RUN:
        print("DRY RUN: nothing will be saved or posted")
    print(f"Date: {TODAY}")

    check_calendar_health()
    active_events = get_active_events()

    content_type, topic, season = get_target_topic(active_events)
    related_posts = get_related_posts(topic)
    kw_ctx = get_keyword_context(topic, content_type)
    image = get_image(topic, content_type)
    headlines = fetch_headlines() if USE_TRENDS else []
    weekly_hook = get_weekly_hook()

    print("Generating post with Groq...")
    post_data = generate_post(headlines, topic, content_type, season, related_posts, kw_ctx, weekly_hook)
    print(f"Title: {post_data['title']}")

    post_data["body"] = format_body(post_data["body"])
    slug = unique_slug(post_data["title"])

    if DRY_RUN:
        print(json.dumps({"slug": slug, "image": image, **post_data}, indent=2, ensure_ascii=False))
        sys.exit(0)

    post_to_sanity(post_data, image, slug)
    update_post_index(post_data["title"], slug, post_data["keywords"], content_type)
    mark_keyword_used(topic["keywords"][0])
    print("Done!")