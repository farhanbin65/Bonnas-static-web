import json
import sys
import os
from pathlib import Path

# Add parent directory to path so we can import the modules
sys.path.insert(0, str(Path(__file__).parent.parent))

# Change to absolute imports
from photo_card_generator import generate_blog_cards

def test_photo_generator():
    """Test the photo card generator with sample data."""
    
    # Load sample data
    sample_file = Path(__file__).parent / "sample_blog_data.json"
    with open(sample_file, "r") as f:
        data = json.load(f)
    
    print("📸 Testing Photo Card Generator\n")
    print("=" * 60)
    
    for blog in data["blogs"]:
        print(f"\n📝 Processing: {blog['title']}")
        print(f"   Image: {blog['featured_image_url']}")
        
        cards = generate_blog_cards(
            blog_title=blog["title"],
            featured_image_url=blog["featured_image_url"]
        )
        
        print(f"   Generated files:")
        for size, path in cards.items():
            print(f"     ✅ {size}: {path}")
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")

if __name__ == "__main__":
    test_photo_generator()