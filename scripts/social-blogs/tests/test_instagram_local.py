"""Preview the JSON pipeline locally; --publish explicitly posts to Instagram."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--publish", action="store_true")
    args = parser.parse_args()
    social_dir = Path(__file__).resolve().parents[1]
    with tempfile.TemporaryDirectory() as directory:
        blog = Path(directory) / "blog.json"
        blog.write_text(json.dumps({"title": "Test Bangladeshi dish", "slug": "test-instagram", "excerpt": "Test recipe post", "keywords": ["biryani"]}))
        result = subprocess.run([sys.executable, str(social_dir / "generate_social_content.py"), "--blog-data", str(blog)], capture_output=True, text=True, check=True)
    manifest = json.loads(result.stdout)
    print(json.dumps(manifest, indent=2, ensure_ascii=False))
    if args.publish:
        environment = dict(os.environ, SOCIAL_MANIFEST_JSON=result.stdout.strip())
        subprocess.run([sys.executable, str(social_dir / "publish" / "instagram_uploader.py")], env=environment, check=True)
    else:
        print("Preview only. Add --publish to post to Instagram.")


if __name__ == "__main__":
    main()
