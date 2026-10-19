"""Upload blog to Instagram."""
import argparse
import json
import os
import sys
import time

import requests

GRAPH = "https://graph.facebook.com/v25.0"
SANITY_ASSETS = "https://u5i02ojt.api.sanity.io/v2024-01-01/assets/images/production"


def host_image(image_path, sanity_token):
    """Upload image to Sanity CDN and return public URL."""
    try:
        with open(image_path, "rb") as f:
            r = requests.post(
                SANITY_ASSETS,
                headers={
                    "Authorization": f"Bearer {sanity_token}",
                    "Content-Type": "image/jpeg"
                },
                data=f,
                timeout=60,
            )
        r.raise_for_status()
        url = r.json()["document"]["url"]
        print(f"✅ Image hosted on Sanity: {url}")
        return url
    except Exception as e:
        print(f"❌ Failed to host image: {e}")
        raise


def upload_to_instagram(manifest_path):
    """Upload to Instagram Business Account."""
    ig_id = os.getenv("INSTAGRAM_BUSINESS_ACCOUNT_ID")
    token = os.getenv("INSTAGRAM_ACCESS_TOKEN")
    sanity_token = os.getenv("SANITY_WRITE_TOKEN")
    
    if not (ig_id and token and sanity_token):
        print("❌ Missing INSTAGRAM_BUSINESS_ACCOUNT_ID, INSTAGRAM_ACCESS_TOKEN, or SANITY_WRITE_TOKEN")
        return None

    # Load manifest
    try:
        with open(manifest_path) as f:
            manifest = json.load(f)
    except Exception as e:
        print(f"❌ Failed to load manifest: {e}")
        return None

    image = manifest.get("photos", {}).get("instagram_square")
    caption = manifest.get("instagram", {}).get("caption_main")
    
    if not image or not caption:
        print("❌ Manifest missing instagram_square or caption_main")
        return None

    if not os.path.exists(image):
        print(f"❌ Image file not found: {image}")
        return None

    # Step 1: Host image on Sanity CDN
    try:
        image_url = host_image(image, sanity_token)
    except Exception as e:
        print(f"❌ Image hosting failed: {e}")
        return None

    # Step 2: Create media container
    try:
        r = requests.post(
            f"{GRAPH}/{ig_id}/media",
            data={
                "image_url": image_url,
                "caption": caption,
                "access_token": token
            },
            timeout=30,
        )
        r.raise_for_status()
        container_id = r.json()["id"]
        print(f"✅ Media container created: {container_id}")
    except Exception as e:
        print(f"❌ Container creation failed: {e}")
        return None

    # Step 3: Wait for processing
    max_wait = 30  # seconds
    start = time.time()
    while time.time() - start < max_wait:
        try:
            r = requests.get(
                f"{GRAPH}/{container_id}",
                params={"fields": "status_code", "access_token": token},
                timeout=30,
            )
            r.raise_for_status()
            status = r.json().get("status_code")
            
            if status == "FINISHED":
                print(f"✅ Media processed (status: {status})")
                break
            elif status in ("ERROR", "EXPIRED"):
                print(f"❌ Media processing failed (status: {status})")
                return None
            
            print(f"⏳ Processing... (status: {status})")
            time.sleep(3)
        except Exception as e:
            print(f"❌ Status check failed: {e}")
            return None
    else:
        print("❌ Media processing timeout after 30s")
        return None

    # Step 4: Publish
    try:
        r = requests.post(
            f"{GRAPH}/{ig_id}/media_publish",
            data={"creation_id": container_id, "access_token": token},
            timeout=30,
        )
        r.raise_for_status()
        post_id = r.json()["id"]
        print(f"✅ Instagram post published: {post_id}")
        return {"platform": "instagram", "post_id": post_id}
    except Exception as e:
        print(f"❌ Publish failed: {e}")
        return None


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload blog to Instagram")
    parser.add_argument("--manifest", required=True, help="Path to manifest.json")
    result = upload_to_instagram(parser.parse_args().manifest)
    if not result:
        sys.exit(1)
    print(json.dumps(result, indent=2))