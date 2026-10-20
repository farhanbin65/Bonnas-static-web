import json
import random
from pathlib import Path

def extract_latest_blog():
    """
    Extract the most recently published blog from post_index.json.
    Enriches it with image data from images.json or falls back to local images.
    """
    index_path = Path("scripts/post_index.json")
    
    if not index_path.exists():
        print("❌ post_index.json not found")
        return None
    
    with open(index_path, "r") as f:
        index_data = json.load(f)
    
    posts = index_data.get("posts", [])
    if not posts:
        print("❌ No posts in index")
        return None
    
    # Most recent post
    latest_post = posts[-1]
    
    print(f"✅ Extracted latest blog: {latest_post['title']}")
    print(f"   Slug: {latest_post['slug']}")
    
    # Step 2: Resolve image if not already present
    if not latest_post.get("image_url"):
        print("📸 Resolving image for blog post...")
        
        # Try to get image from images.json (local images)
        images_path = Path("scripts/images.json")
        if images_path.exists():
            with open(images_path, "r") as f:
                images_data = json.load(f)
            
            local_images = images_data.get("local_images", [])
            if local_images:
                # Pick random image from local_images
                selected_image = random.choice(local_images)
                image_url = f"https://www.bonnas.co.uk{selected_image['path']}"
                latest_post["image_url"] = image_url
                latest_post["image_alt"] = selected_image.get("alt", "Bonnas food image")
                latest_post["image_source"] = "local"
                print(f"✅ Image resolved (local): {selected_image['path']}")
            else:
                print("⚠️  No local images found in images.json")
        else:
            print(f"⚠️  images.json not found at {images_path}")
    
    # Save enriched data
    with open("latest_blog.json", "w") as f:
        json.dump(latest_post, f, indent=2)
    
    print(f"✅ Saved to latest_blog.json")
    return latest_post


if __name__ == "__main__":
    extract_latest_blog()