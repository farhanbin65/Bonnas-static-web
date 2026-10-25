import json
import os
import sys
import time

import requests

from dotenv import load_dotenv

load_dotenv(override=False)
GRAPH = "https://graph.facebook.com/v25.0"
SANITY_ASSETS = "https://u5i02ojt.api.sanity.io/v2024-01-01/assets/images/production"



def host_image(path, sanity_token):
    # Instagram fetches the image itself, so it needs a public URL; Sanity's CDN gives one instantly
    with open(path, "rb") as f:
        r = requests.post(
            SANITY_ASSETS,
            headers={"Authorization": f"Bearer {sanity_token}", "Content-Type": "image/jpeg"},
            data=f,
            timeout=60,
        )
    r.raise_for_status()
    return r.json()["document"]["url"]


def upload_to_instagram(manifest=None):
    ig_id = os.getenv("INSTAGRAM_BUSINESS_ACCOUNT_ID")
    token = os.getenv("INSTAGRAM_ACCESS_TOKEN")
    sanity_token = os.getenv("SANITY_WRITE_TOKEN")
    if not (ig_id and token):
        print("❌ Missing INSTAGRAM_BUSINESS_ACCOUNT_ID or INSTAGRAM_ACCESS_TOKEN")
        return None

    if manifest is None:
        try:
            manifest = json.loads(os.environ["SOCIAL_MANIFEST_JSON"])
        except (KeyError, ValueError):
            print("❌ Missing or invalid SOCIAL_MANIFEST_JSON")
            return None
    if not isinstance(manifest, dict) or not isinstance(manifest.get("photos"), dict) or not isinstance(manifest.get("instagram"), dict):
        print("❌ Invalid social manifest structure")
        return None
    image = manifest.get("photos", {}).get("instagram_square")
    caption = manifest.get("instagram", {}).get("caption_main")
    if not (image and caption and (image.startswith("https://") or os.path.exists(image))):
        print(f"❌ Manifest has no Instagram photo or caption")
        print(f"   Image file: {image}")
        print(f"   Image exists: {os.path.exists(image) if image else False}")
        print(f"   Caption length: {len(caption) if caption else 0}")
        return None

    if image.startswith("https://"):
        image_url = image
    else:
        if not sanity_token:
            print("❌ SANITY_WRITE_TOKEN is required only for local image uploads")
            return None
        image_url = host_image(image, sanity_token)
    r = requests.post(
        f"{GRAPH}/{ig_id}/media",
        data={"image_url": image_url, "caption": caption, "access_token": token},
        timeout=30,
    )
    if not r.ok:
        print(f"❌ Container failed: {r.text}")
        return None
    container = r.json()["id"]

    for _ in range(10):  # shortcut: gives up after ~30s, raise it if you ever post video
        status = requests.get(
            f"{GRAPH}/{container}",
            params={"fields": "status_code", "access_token": token},
            timeout=30,
        ).json().get("status_code")
        if status == "FINISHED":
            break
        if status in ("ERROR", "EXPIRED"):
            print(f"❌ Container status: {status}")
            return None
        time.sleep(3)
    else:
        print("❌ Container still processing after 30s")
        return None

    r = requests.post(
        f"{GRAPH}/{ig_id}/media_publish",
        data={"creation_id": container, "access_token": token},
        timeout=30,
    )
    if not r.ok:
        print(f"❌ Publish failed: {r.text}")
        return None

    post_id = r.json()["id"]
    print(f"✅ Instagram post published: {post_id}")
    return {"platform": "instagram", "post_id": post_id}


if __name__ == "__main__":
    result = upload_to_instagram()
    if not result:
        sys.exit(1)
    print(json.dumps(result, indent=2))