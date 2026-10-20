"""
Local test for Instagram posting without GitHub Actions.
Tests the full pipeline: card generation → Sanity upload → Instagram container + publish.

Usage:
    python test_instagram_local.py

Requires:
    - .env file with: INSTAGRAM_BUSINESS_ACCOUNT_ID, INSTAGRAM_ACCESS_TOKEN, SANITY_WRITE_TOKEN
    - A sample blog data JSON (or this script creates one)
"""
import os
import sys
import json
import tempfile
from pathlib import Path

# Add scripts to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "Bonnas-static-web" / "scripts"))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "Bonnas-static-web" / "scripts" / "social-blogs"))

from dotenv import load_dotenv

# Load env
load_dotenv(override=True)

IG_ID = os.getenv("INSTAGRAM_BUSINESS_ACCOUNT_ID")
IG_TOKEN = os.getenv("INSTAGRAM_ACCESS_TOKEN")
SANITY_TOKEN = os.getenv("SANITY_WRITE_TOKEN")

print("=" * 60)
print("INSTAGRAM LOCAL TEST")
print("=" * 60)

# Check env
missing = [n for n, v in [
    ("INSTAGRAM_BUSINESS_ACCOUNT_ID", IG_ID),
    ("INSTAGRAM_ACCESS_TOKEN", IG_TOKEN),
    ("SANITY_WRITE_TOKEN", SANITY_TOKEN)
] if not v]

if missing:
    print(f"❌ Missing env vars: {', '.join(missing)}")
    sys.exit(1)

print(f"✅ IG Account ID: {IG_ID}")
print(f"✅ IG Token (first 20 chars): {IG_TOKEN[:20]}...")
print(f"✅ Sanity Token: {'set' if SANITY_TOKEN else 'missing'}")
print()

# Step 1: Create a sample blog data file
print("Step 1: Creating sample blog data...")
blog_data = {
    "title": "Test Recipe for Instagram",
    "slug": "test-recipe-instagram",
    "featured_image_url": "https://picsum.photos/800/600?random=123",
    "excerpt": "This is a test recipe post for Instagram.",
    "keywords": ["test", "recipe"],
}

with tempfile.TemporaryDirectory() as tmpdir:
    blog_file = Path(tmpdir) / "latest_blog.json"
    with open(blog_file, "w") as f:
        json.dump(blog_data, f)
    print(f"✅ Blog data: {blog_file}")
    print()

    # Step 2: Generate social content (card + manifest)
    print("Step 2: Generating social media card...")
    output_dir = Path(tmpdir) / "social_posts"
    output_dir.mkdir(parents=True)
    
    cmd = f"python scripts/social-blogs/generate_social_content.py --blog-data {blog_file} --output-dir {output_dir}"
    print(f"Running: {cmd}")
    result = os.system(cmd)
    
    if result != 0:
        print("❌ Card generation failed")
        sys.exit(1)
    
    # Find manifest
    manifest_files = list(output_dir.glob("*manifest*.json"))
    if not manifest_files:
        print(f"❌ No manifest found in {output_dir}")
        print("Files generated:")
        for f in output_dir.glob("*"):
            print(f"  - {f.name}")
        sys.exit(1)
    
    manifest_path = manifest_files[0]
    print(f"✅ Manifest: {manifest_path}")
    print()

    # Step 3: Test Instagram upload
    print("Step 3: Uploading to Instagram...")
    print()
    
    import requests
    import time
    
    # Read manifest
    with open(manifest_path) as f:
        manifest = json.load(f)
    
    image = manifest.get("photos", {}).get("instagram_square")
    caption = manifest.get("instagram", {}).get("caption_main")
    
    print(f"Instagram card: {image}")
    print(f"Caption: {caption[:100]}...")
    print()
    
    if not (image and caption and os.path.exists(image)):
        print(f"❌ Manifest missing card or caption")
        print(f"   Image exists: {os.path.exists(image) if image else False}")
        print(f"   Caption: {'yes' if caption else 'no'}")
        sys.exit(1)
    
    # 3a. Upload image to Sanity
    print("3a. Uploading image to Sanity...")
    SANITY_ASSETS = "https://u5i02ojt.api.sanity.io/v2024-01-01/assets/images/production"
    
    with open(image, "rb") as f:
        r = requests.post(
            SANITY_ASSETS,
            headers={"Authorization": f"Bearer {SANITY_TOKEN}", "Content-Type": "image/jpeg"},
            data=f,
            timeout=60,
        )
    
    if not r.ok:
        print(f"❌ Sanity upload failed: {r.text}")
        sys.exit(1)
    
    image_url = r.json()["document"]["url"]
    print(f"✅ Image hosted: {image_url}")
    print()
    
    # 3b. Create Instagram container
    print("3b. Creating Instagram media container...")
    GRAPH = "https://graph.facebook.com/v25.0"
    
    r = requests.post(
        f"{GRAPH}/{IG_ID}/media",
        data={"image_url": image_url, "caption": caption, "access_token": IG_TOKEN},
        timeout=30,
    )
    
    if not r.ok:
        print(f"❌ Container creation failed: {r.text}")
        sys.exit(1)
    
    container_id = r.json()["id"]
    print(f"✅ Container created: {container_id}")
    print()
    
    # 3c. Poll for FINISHED
    print("3c. Waiting for container to process...")
    for attempt in range(10):
        status_r = requests.get(
            f"{GRAPH}/{container_id}",
            params={"fields": "status_code", "access_token": IG_TOKEN},
            timeout=30,
        )
        status = status_r.json().get("status_code")
        print(f"   Attempt {attempt+1}/10: {status}")
        
        if status == "FINISHED":
            print(f"✅ Container ready")
            break
        elif status in ("ERROR", "EXPIRED"):
            print(f"❌ Container failed: {status}")
            sys.exit(1)
        
        time.sleep(3)
    else:
        print(f"❌ Container still processing after 30s")
        sys.exit(1)
    
    print()
    
    # 3d. Publish
    print("3d. Publishing to Instagram...")
    r = requests.post(
        f"{GRAPH}/{IG_ID}/media_publish",
        data={"creation_id": container_id, "access_token": IG_TOKEN},
        timeout=30,
    )
    
    if not r.ok:
        print(f"❌ Publish failed: {r.text}")
        sys.exit(1)
    
    post_id = r.json()["id"]
    print(f"✅ Published! Post ID: {post_id}")
    print()
    
    # Get permalink
    r = requests.get(
        f"{GRAPH}/{post_id}",
        params={"fields": "permalink", "access_token": IG_TOKEN},
        timeout=30,
    )
    
    if r.ok:
        permalink = r.json().get("permalink", "N/A")
        print(f"📱 View at: {permalink}")
    
    print()
    print("=" * 60)
    print("✅ ALL TESTS PASSED")
    print("=" * 60)