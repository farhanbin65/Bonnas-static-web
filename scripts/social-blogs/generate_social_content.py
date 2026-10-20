"""Generate photo cards + captions for a blog post. Entry point for GitHub Actions."""
import argparse
import json
import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parent))

from social_media_orchestrator import orchestrate_blog_post


def main():
    parser = argparse.ArgumentParser(description="Generate social media content from blog data")
    parser.add_argument("--blog-data", required=True, help="Path to latest_blog.json")
    parser.add_argument("--output-dir", required=True, help="Output directory for social posts")
    args = parser.parse_args()

    # Load blog data
    with open(args.blog_data) as f:
        blog_data = json.load(f)

    # Validate required fields
    if not blog_data.get("image_url"):
        print("❌ Blog has no image_url. Exiting.")
        sys.exit(1)

    if "featured_image_url" not in blog_data:
        print("❌ No featured_image_url, skipping social post")
        sys.exit(1)

    if not blog_data.get("excerpt"):
        print("⚠️  Blog has no excerpt; using empty string")
        blog_data["excerpt"] = ""

    # Orchestrate social content generation
    try:
        manifest_path = orchestrate_blog_post(blog_data, args.output_dir)
        print(f"✅ Social content generated: {manifest_path}")
        
        # Output manifest path for GitHub Actions
        print(f"::set-output name=manifest_path::{manifest_path}")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Social content generation failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()