"""Prepare captions and original-photo URLs; publishing runs in separate steps."""
import argparse
from contextlib import redirect_stdout
import sys
import json
from pathlib import Path

from extract_latest_blog import extract_latest_blog
from social_media_orchestrator import orchestrate_blog_post


def main():
    parser = argparse.ArgumentParser(description="Prepare social posts using unchanged photos")
    parser.add_argument("--blog-data", default="latest_blog.json")
    args = parser.parse_args()
    project_root = Path(__file__).resolve().parents[2]
    blog_path = project_root / args.blog_data
    # stdout is a single JSON object for the workflow; diagnostics go to stderr.
    with redirect_stdout(sys.stderr):
        if blog_path.exists():
            with open(blog_path, encoding="utf-8") as file:
                blog_data = json.load(file)
        else:
            blog_data = extract_latest_blog()
        if not blog_data:
            raise SystemExit("No blog post available")
        blog_data.setdefault("excerpt", "")
        blog_data.setdefault("keywords", [])
        manifest = orchestrate_blog_post(blog_data)
        if not manifest or not manifest["facebook"] or not manifest["instagram"]:
            raise SystemExit("Social content preparation failed")
    print(json.dumps(manifest, ensure_ascii=False, separators=(",", ":")))


if __name__ == "__main__":
    main()
