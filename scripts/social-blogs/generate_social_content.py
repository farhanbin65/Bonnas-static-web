"""Main orchestrator for generating and posting social content."""
import json
import sys
import argparse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from extract_latest_blog import extract_latest_blog
from photo_card_generator import generate_blog_cards
from social_media_orchestrator import orchestrate_blog_post


def main():
    """Main flow: extract blog → generate cards → post to socials."""
    
    # Parse command-line arguments (from workflow)
    parser = argparse.ArgumentParser(description="Generate social media content")
    parser.add_argument("--blog-data", default="latest_blog.json", help="Path to blog data JSON")
    parser.add_argument("--output-dir", default="output/social_posts", help="Output directory for social posts")
    args = parser.parse_args()
    
    # Set output directory (absolute path from project root)
    project_root = Path(__file__).parent.parent.parent
    output_dir = project_root / args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"📁 Output directory ready: {output_dir.absolute()}")
    
    # Step 1: Always call extract_latest_blog() to enrich with image
    print("📝 Enriching blog post with image data...")
    blog_data = extract_latest_blog()
    
    if not blog_data:
        print("❌ No blog post found.")
        sys.exit(1)
    
    # Step 2: Verify image exists
    image_url = blog_data.get("image_url")
    if not image_url:
        print("❌ Blog has no image_url after enrichment. Exiting.")
        sys.exit(1)
    
    print(f"✅ Image URL ready: {image_url[:80]}...")
    
    # Step 3: Generate photo cards
    print("🎨 Generating photo cards...")
    try:
        cards = generate_blog_cards(
            blog_title=blog_data.get("title", "Bonnas Blog"),
            featured_image_url=image_url,
            output_base=str(output_dir)
        )
        print(f"✅ Cards generated: {list(cards.keys())}")
        
        # Verify cards actually exist
        for size_key, card_path in cards.items():
            card_path_obj = Path(card_path)
            if card_path_obj.exists():
                print(f"   ✓ {size_key}: {card_path_obj.name}")
            else:
                print(f"   ✗ {size_key}: NOT FOUND")
    
    except Exception as e:
        print(f"❌ Card generation failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    # Step 4: Post to social media (orchestrator)
    print("📱 Orchestrating social media content...")
    try:
        orchestrate_blog_post(blog_data, cards)
        print("✅ Social media orchestration complete!")
    except Exception as e:
        print(f"⚠️  Social orchestration failed: {e}")
        import traceback
        traceback.print_exc()
    
    # Step 5: Create manifest.json (required by workflow)
    manifest = {
        "post_id": blog_data.get("slug"),
        "title": blog_data.get("title"),
        "excerpt": blog_data.get("excerpt"),
        "photos": {size_key: str(Path(path).name) for size_key, path in cards.items()},
        "facebook": {
            "caption": blog_data.get("facebook_caption", blog_data.get("excerpt", "")),
            "link": f"https://www.bonnas.co.uk/blog/{blog_data.get('slug')}"
        },
        "instagram": {
            "caption": blog_data.get("instagram_caption", blog_data.get("excerpt", "")),
            "hashtags": blog_data.get("hashtags", [])
        }
    }
    
    manifest_path = output_dir / "manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\n✅ Manifest created: {manifest_path.name}")
    print(f"✨ Pipeline complete! Output: {output_dir.absolute()}")


if __name__ == "__main__":
    main()