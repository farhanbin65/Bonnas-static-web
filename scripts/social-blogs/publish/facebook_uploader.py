import argparse
import json
import os
import sys

import requests

from dotenv import load_dotenv

load_dotenv(override=True)
GRAPH = "https://graph.facebook.com/v25.0"
def upload_to_facebook(manifest_path):
    page_id = os.getenv("FACEBOOK_PAGE_ID")
    token = os.getenv("FACEBOOK_ACCESS_TOKEN")
    if not page_id or not token:
        print("❌ Missing FACEBOOK_PAGE_ID or FACEBOOK_ACCESS_TOKEN")
        return None

    with open(manifest_path) as f:
        manifest = json.load(f)
    image = manifest.get("photos", {}).get("facebook")
    fb = manifest.get("facebook", {})
    caption = fb.get("caption_extended") or fb.get("caption_standard")
    if not (image and caption and (image.startswith("https://") or os.path.exists(image))):
        print("❌ Manifest has no Facebook photo or caption")
        return None

    # One call posts photo + caption together; needs a Page token, not a user token
    if image.startswith("https://"):
        r = requests.post(
            f"{GRAPH}/{page_id}/photos",
            data={"url": image, "caption": caption, "access_token": token},
            timeout=60,
        )
    else:
        with open(image, "rb") as f:
            r = requests.post(
                f"{GRAPH}/{page_id}/photos",
                data={"caption": caption, "access_token": token},
                files={"source": f},
                timeout=60,
            )
    if not r.ok:
        print(f"❌ Facebook post failed: {r.text}")
        return None

    data = r.json()
    post_id = data.get("post_id") or data["id"]
    print(f"✅ Facebook post created: {post_id}")
    return {"platform": "facebook", "post_id": post_id, "url": f"https://facebook.com/{post_id}"}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload blog to Facebook")
    parser.add_argument("--manifest", required=True, help="Path to manifest.json")
    result = upload_to_facebook(parser.parse_args().manifest)
    if not result:
        sys.exit(1)
    print(json.dumps(result, indent=2))