# scripts/social-blogs/generate_social_content.py

import argparse
import json
import os
from pathlib import Path
from extract_latest_blog import extract_latest_blog
from social_media_orchestrator import orchestrate_blog_post


def main():
    parser = argparse.ArgumentParser(description="Prepare social posts using unchanged photos")
    parser.add_argument("--blog-data", default="latest_blog.json")
    parser.add_argument("--output-dir", default="output/social_posts")
    parser.add_argument("--manifest-out", default=None)
    args = parser.parse_args()
    
    project_root = Path(__file__).resolve().parents[2]
    blog_path = project_root / args.blog_data
    
    if blog_path.exists():
        with open(blog_path, encoding="utf-8") as file:
            blog_data = json.load(file)
    else:
        blog_data = extract_latest_blog()
    
    if not blog_data:
        raise SystemExit("No blog post available")
    
    blog_data.setdefault("excerpt", "")
    blog_data.setdefault("keywords", [])
    
    # ONLY 1 argument: blog_data (remove the output_dir argument)
    result = orchestrate_blog_post(blog_data)
    
    if not result or not result["facebook"] or not result["instagram"]:
        raise SystemExit("Social content preparation failed")
    
    # Write manifest to predictable path
    manifest_path = args.manifest_out or (project_root / args.output_dir / "manifest.json")
    os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
    
    with open(manifest_path, 'w') as f:
        json.dump({
            "post_id": result["post_id"],
            "blog": blog_data,
            "photos": result["photos"],
            "facebook": result["facebook"],
            "instagram": result["instagram"],
        }, f, indent=2)
    
    print(f"Manifest saved: {manifest_path}")


if __name__ == "__main__":
    main()