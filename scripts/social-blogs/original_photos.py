"""Select an unchanged BONNAS library photo for social posts."""
import json
import random
import re
from pathlib import Path

IMAGES_FILE = Path(__file__).resolve().parents[1] / "images.json"


def image_url(image):
    path = image["path"]
    return path if path.startswith("https://") else f"https://www.bonnas.co.uk{path}"


def select_original_photo(blog_data, images_file=IMAGES_FILE):
    with open(images_file, encoding="utf-8") as file:
        images = json.load(file).get("local_images", [])
    images = [image for image in images if image.get("path")]
    if not images:
        raise ValueError("images.json has no photos available for social posts")

    # Reuse the blog photo when it already comes from our library.
    featured = blog_data.get("featured_image_url") or blog_data.get("image_url")
    selected = next((image for image in images if image_url(image) == featured), None)
    if selected is None:
        def terms(text):
            return set(re.findall(r"[a-z]{3,}", text.lower()))
        keywords = blog_data.get("keywords") or []
        if isinstance(keywords, str):
            keywords = [keywords]
        wanted = terms(" ".join([blog_data.get("title", ""), *keywords]))
        scores = [(len(wanted & terms(" ".join(image.get("tags", [])))), image) for image in images]
        best = max(score for score, _ in scores)
        selected = random.choice([image for score, image in scores if score == best])
    return {"facebook": image_url(selected), "instagram_square": image_url(selected)}
