"""Upload blog to Facebook."""
import argparse
import json
import os
import sys

import requests

GRAPH = "https://graph.facebook.com/v25.0"


def upload_to_facebook(manifest_path):
    """Upload to Facebook Page."""
    page_id = os.getenv("FACEBOOK_PAGE_ID")
    token = os.getenv("FACEBOOK_ACCESS_TOKEN")
    
    if not page_id or not token:
        print("❌ Missing FACEBOOK_PAGE_ID or FACEBOOK_ACCESS_TOKEN")
        return None

    # Load manifest
    try:
        with open(manifest_path) as f:
            manifest = json.load(f)
    except Exception as e:
        print(f"❌ Failed to load manifest: {e}")
        return None

    image = manifest.get("photos", {}).get("facebook")
    caption = manifest.get("facebook", {}).get("caption_extended") or manifest.get("facebook", {}).get("caption_standard")
    
    if not image or not caption:
        print("❌ Manifest missing facebook photo or caption")
        return None

    if not os.path.exists(image):
        print(f"❌ Image file not found: {image}")
        return None

    # Single call: POST /page_id/photos with image + caption
    try:
        with open(image, "rb") as f:
            r = requests.post(
                f"{GRAPH}/{page_id}/photos",
                data={"caption": caption, "access_token": token},
                files={"source": f},
                timeout=60,
            )
        r.raise_for_status()
        data = r.json()
        post_id = data.get("post_id") or data.get("id")
        print(f"✅ Facebook post created: {post_id}")
        return {"platform": "facebook", "post_id": post_id, "url": f"https://facebook.com/{post_id}"}
    except Exception as e:
        print(f"❌ Facebook upload failed: {e}")
        return None


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload blog to Facebook")
    parser.add_argument("--manifest", required=True, help="Path to manifest.json")
    result = upload_to_facebook(parser.parse_args().manifest)
    if not result:
        sys.exit(1)
    print(json.dumps(result, indent=2))