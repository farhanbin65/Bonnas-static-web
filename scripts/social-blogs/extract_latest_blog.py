import json
import os
import sys
from pathlib import Path

def extract_latest_blog():
    """
    Extract the most recently published blog from post_index.json.
    Enriches it with image data.
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
        
        # Add scripts directory to path for imports
        scripts_dir = Path("scripts")
        sys.path.insert(0, str(scripts_dir))
        
        try:
            # Import get_image from generate_blog.py
            from generate_blog import get_image
            
            image_data = get_image(latest_post, "blog")
            if image_data:
                latest_post["image_url"] = image_data["url"]
                latest_post["image_alt"] = image_data.get("alt", "Blog featured image")
                latest_post["image_source"] = image_data.get("source", "unknown")
                print(f"✅ Image resolved ({image_data.get('source', 'unknown')})")
                print(f"   URL: {image_data['url'][:80]}...")
            else:
                print("⚠️  Could not resolve image from get_image()")
                # Provide a fallback
                latest_post["image_url"] = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200"
                latest_post["image_alt"] = "Bangladeshi Food"
                latest_post["image_source"] = "fallback"
                print("   Using fallback image")
        
        except ImportError as e:
            print(f"⚠️  Could not import get_image: {e}")
            print("   Using fallback image")
            latest_post["image_url"] = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200"
            latest_post["image_alt"] = "Bangladeshi Food"
            latest_post["image_source"] = "fallback"
        
        except Exception as e:
            print(f"⚠️  Error resolving image: {e}")
            print("   Using fallback image")
            latest_post["image_url"] = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200"
            latest_post["image_alt"] = "Bangladeshi Food"
            latest_post["image_source"] = "fallback"
    
    # Save enriched data
    with open("latest_blog.json", "w") as f:
        json.dump(latest_post, f, indent=2)
    
    print(f"✅ Saved to latest_blog.json")
    return latest_post


if __name__ == "__main__":
    extract_latest_blog()