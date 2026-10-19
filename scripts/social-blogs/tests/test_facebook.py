"""
Scratch test for the Facebook Graph API. Not part of the pipeline.

Usage:
    python test_facebook.py auth                  # check token + page
    python test_facebook.py text                  # post a text message
    python test_facebook.py photo card.jpg        # post a photo with caption
    Add --cleanup to delete the post right after it is created.

Env vars (rename below if yours differ):
    FB_PAGE_ID
    FB_PAGE_ACCESS_TOKEN
    FB_GRAPH_VERSION   (optional, check Meta's docs for the current one)
"""
import os
import sys
import json
import requests

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # fine if env vars are already exported

PAGE_ID = os.getenv("517357318138329")
TOKEN = os.getenv("EAARnji2U7xQBS6KYI3rxqFbIUPLkWjPGXziCmnrZBULj0pZAOvJAZBSsw0wEbiEMSHZAXoob352hds35ZB3ZBJYynJUUTHI8N3DkPwGjHSOt7JC1ddZCPoiGHKwGaDu5dxdZAUzEHalxNtsrDcE2KhxO6c6RkMO1UWvBKZAsqUtTfJo0ZCIh0CmZAOr3hqua9Bx")
VERSION = os.getenv("FB_GRAPH_VERSION", "v23.0")
BASE = f"https://graph.facebook.com/{VERSION}"


def show(resp):
    print(f"HTTP {resp.status_code}")
    try:
        print(json.dumps(resp.json(), indent=2))
    except ValueError:
        print(resp.text)


def check_env():
    missing = [n for n, v in [("FB_PAGE_ID", PAGE_ID), ("FB_PAGE_ACCESS_TOKEN", TOKEN)] if not v]
    if missing:
        sys.exit(f"Missing env vars: {', '.join(missing)}")


def auth():
    print("--- Who does this token belong to? ---")
    show(requests.get(f"{BASE}/me", params={"fields": "id,name", "access_token": TOKEN}))
    print("\n--- Page details ---")
    show(requests.get(
        f"{BASE}/{PAGE_ID}",
        params={"fields": "id,name,instagram_business_account", "access_token": TOKEN},
    ))


def post_text():
    resp = requests.post(
        f"{BASE}/{PAGE_ID}/feed",
        data={"message": "API test post - safe to delete", "access_token": TOKEN},
    )
    show(resp)
    return resp.json().get("id") if resp.ok else None


def post_photo(path):
    with open(path, "rb") as f:
        resp = requests.post(
            f"{BASE}/{PAGE_ID}/photos",
            data={"caption": "API photo test - safe to delete", "access_token": TOKEN},
            files={"source": f},
        )
    show(resp)
    return resp.json().get("post_id") or resp.json().get("id") if resp.ok else None


def delete_post(post_id):
    print(f"\n--- Deleting {post_id} ---")
    show(requests.delete(f"{BASE}/{post_id}", params={"access_token": TOKEN}))


if __name__ == "__main__":
    check_env()
    args = [a for a in sys.argv[1:] if a != "--cleanup"]
    cleanup = "--cleanup" in sys.argv
    if not args:
        sys.exit(__doc__)

    stage = args[0]
    post_id = None
    if stage == "auth":
        auth()
    elif stage == "text":
        post_id = post_text()
    elif stage == "photo":
        if len(args) < 2:
            sys.exit("Give an image path: python test_facebook.py photo card.jpg")
        post_id = post_photo(args[1])
    else:
        sys.exit(__doc__)

    if cleanup and post_id:
        delete_post(post_id)