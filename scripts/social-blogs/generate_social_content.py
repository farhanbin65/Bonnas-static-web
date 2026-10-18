import json
import sys
import os
from pathlib import Path
import argparse

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent))

from social_media_orchestrator import orchestrate_blog_post

def main():
    parser = argparse.ArgumentParser(description="Generate social media content from blog data")
    parser.add_argument("--blog-data", required=True, help="Path to blog data JSON file")
    parser.add_argument("--output-dir", default="output/social_posts", help="Output directory")
    
    args = parser.parse_args()
    
    # Load blog data
    if not os.path.exists(args.blog_data):
        print(f"❌ Blog data file not found: {args.blog_data}")
        sys.exit(1)
    
    with open(args.blog_data, "r") as f:
        blog_data = json.load(f)
    
    # Ensure required fields
    required = ["title", "slug", "keywords"]
    missing = [k for k in required if k not in blog_data]
    if missing:
        print(f"❌ Missing required fields: {missing}")
        sys.exit(1)
    
    # Add defaults if missing
    if "excerpt" not in blog_data:
        blog_data["excerpt"] = blog_data.get("body", "")[:160]
    
    if "featured_image_url" not in blog_data:
        print("⚠️  No featured_image_url provided, using placeholder")
        blog_data["featured_image_url"] = "https://images.unsplash.com/photo-1568150950473-9546926281c2?w=1200"
    
    # Run orchestrator
    result = orchestrate_blog_post(blog_data, args.output_dir)
    
    if result:
        # Output manifest path for next steps
        print(f"::set-output name=manifest_path::{result['manifest_path']}")
        print(f"::set-output name=post_id::{result['post_id']}")
        sys.exit(0)
    else:
        print("❌ Failed to generate social content")
        sys.exit(1)

if __name__ == "__main__":
    main()