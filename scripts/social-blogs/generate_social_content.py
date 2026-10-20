"""Main orchestrator for generating and posting social content."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from extract_latest_blog import extract_latest_blog
from photo_card_generator import generate_blog_cards
from social_media_orchestrator import orchestrate_blog_post

def main():
    """Main flow: extract blog → generate cards → post to socials."""
    
    # Step 0: Ensure output directory exists
    output_dir = Path("output/cards")
    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"📁 Output directory ready: {output_dir}")
    
    # Step 1: Extract latest blog with image resolution
    print("📝 Extracting latest blog post...")
    blog_data = extract_latest_blog()
    
    if not blog_data:
        print("❌ No blog post found.")
        sys.exit(1)
    
    # Step 2: Verify image exists
    image_url = blog_data.get("image_url")
    if not image_url:
        print("❌ Blog has no image_url. Exiting.")
        sys.exit(1)
    
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
            if Path(card_path).exists():
                print(f"   ✓ {size_key}: {card_path}")
            else:
                print(f"   ✗ {size_key}: NOT FOUND at {card_path}")
    
    except Exception as e:
        print(f"❌ Card generation failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    # Step 4: Post to social media
    print("📱 Posting to social media...")
    try:
        orchestrate_blog_post(blog_data, cards)
        print("✅ Social media posting complete!")
    except Exception as e:
        print(f"⚠️  Social posting failed: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n✨ Pipeline complete!")