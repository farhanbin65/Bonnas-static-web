import json
import os
import sys
from pathlib import Path

def extract_latest_blog():
    """
    Extract the most recently published blog from post_index.json.
    Enriches it with image data by calling get_image() from generate_blog.
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
    
    # Most recent post (assuming last added is most recent)
    latest_post = posts[-1]
    
    print(f"✅ Extracted latest blog: {latest_post['title']}")
    print(f"   Slug: {latest_post['slug']}")
    
    # Step 2: Resolve image if not already present
    if not latest_post.get("image_url"):
        print("📸 Resolving image for blog post...")
        
        # Import from parent directory (scripts/)
        parent_dir = Path(__file__).parent.parent
        sys.path.insert(0, str(parent_dir))
        
        try:
            from generate_blog import get_image
            
            image_data = get_image(latest_post, "blog")
            if image_data:
                latest_post["image_url"] = image_data["url"]
                latest_post["image_alt"] = image_data["alt"]
                latest_post["image_source"] = image_data["source"]
                print(f"✅ Image resolved ({image_data['source']}): {image_data['url']}")
            else:
                print("⚠️  Could not resolve image - social cards may fail")
        except ImportError as e:
            print(f"❌ Could not import generate_blog: {e}")
            return None
    
    # Save enriched data for next step
    with open("latest_blog.json", "w") as f:
        json.dump(latest_post, f, indent=2)
    
    return latest_post

if __name__ == "__main__":
    extract_latest_blog()