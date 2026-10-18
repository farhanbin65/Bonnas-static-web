import json
import os
from pathlib import Path

def extract_latest_blog():
    """
    Extract the most recently published blog from post_index.json.
    This was just created by generate_blog.py.
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
    
    # Save for next step
    with open("latest_blog.json", "w") as f:
        json.dump(latest_post, f, indent=2)
    
    return latest_post

if __name__ == "__main__":
    extract_latest_blog()