import os
from PIL import Image
from io import BytesIO
import requests

# Change these from relative to absolute imports
from config import CARD_SIZES, OUTPUT_DIR, WEBSITE, get_text_sizes, get_padding
from utils import (
    resize_image_to_card,
    load_logo,
    draw_text_overlay,
    paste_logo_top_left,
    fetch_image_from_url
)

class PhotoCardGenerator:
    """
    Generate photo cards for Bonna's blog posts.
    Outputs 3 sizes: Instagram square, Facebook square, Instagram Stories.
    """
    
    def __init__(self, blog_title, featured_image_url, output_base=None):
        """
        Args:
            blog_title (str): Blog post title (2-3 words ideal)
            featured_image_url (str): URL to featured image
            output_base (str): Optional base path for output files
        """
        self.blog_title = blog_title
        self.featured_image_url = featured_image_url
        self.output_base = output_base or OUTPUT_DIR
        os.makedirs(self.output_base, exist_ok=True)
        
        # Fetch and prepare base image
        self.base_image = self._load_image()
    
    def _load_image(self):
        """Fetch and load featured image."""
        try:
            response = requests.get(self.featured_image_url, timeout=10)
            response.raise_for_status()
            img = Image.open(BytesIO(response.content)).convert("RGB")
            print(f"✅ Loaded image: {self.featured_image_url}")
            return img
        except Exception as e:
            print(f"❌ Failed to load image: {e}")
            return None
    
    def _generate_card(self, size_key):
        """Generate a single card for given size."""
        if self.base_image is None:
            print(f"⚠️  Cannot generate {size_key} — image not loaded")
            return None
        
        width, height = CARD_SIZES[size_key]
        
        # Resize image to card dimensions
        card_image = resize_image_to_card(self.base_image, width, height)
        
        # Convert to RGBA for overlay
        card_image = card_image.convert("RGBA")
        
        # Prepare config for this size
        card_config = {
            "width": width,
            "height": height,
            "text_sizes": get_text_sizes(width),
            "padding": get_padding(width),
        }
        
        # Load logo (size relative to card)
        logo_size = int(width * 0.12)  # 130px for 1080w
        logo = load_logo(logo_size)
        
        # Add overlays
        if logo:
            paste_logo_top_left(card_image, logo, padding=int(width * 0.03))
        
        draw_text_overlay(card_image, self.blog_title, WEBSITE, card_config)
        
        # Convert back to RGB for PNG save
        card_image = card_image.convert("RGB")
        
        return card_image
    
    def generate_all(self):
        """Generate all three card sizes. Returns dict with file paths."""
        output_files = {}
        
        for size_key in CARD_SIZES.keys():
            print(f"\n🎨 Generating {size_key}...")
            card = self._generate_card(size_key)
            
            if card is None:
                continue
            
            # Save to file
            filename = f"{size_key}.png"
            filepath = os.path.join(self.output_base, filename)
            card.save(filepath, "PNG", quality=95)
            output_files[size_key] = filepath
            print(f"✅ Saved: {filepath}")
        
        return output_files
    
    def generate_single(self, size_key):
        """Generate a single card size."""
        if size_key not in CARD_SIZES:
            print(f"❌ Unknown size: {size_key}. Options: {list(CARD_SIZES.keys())}")
            return None
        
        card = self._generate_card(size_key)
        if card is None:
            return None
        
        filename = f"{size_key}.png"
        filepath = os.path.join(self.output_base, filename)
        card.save(filepath, "PNG", quality=95)
        print(f"✅ Saved: {filepath}")
        
        return filepath


# ─── Standalone Function ────────────────────────────────────────
def generate_blog_cards(blog_title, featured_image_url, output_base=None):
    """
    Quick function to generate all card sizes for a blog post.
    
    Args:
        blog_title (str): Blog post title
        featured_image_url (str): URL to featured image
        output_base (str): Optional output directory
    
    Returns:
        dict: {size_key: filepath}
    
    Example:
        cards = generate_blog_cards(
            "Chicken Biryani Recipe",
            "https://bonnas.co.uk/images/biryani.jpg"
        )
    """
    generator = PhotoCardGenerator(blog_title, featured_image_url, output_base)
    return generator.generate_all()


if __name__ == "__main__":
    # Test example
    test_title = "Chicken Biryani Recipe"
    test_image_url = "https://images.unsplash.com/photo-1568150950473-9546926281c2?w=1200"
    
    print("🚀 Testing Photo Card Generator...\n")
    cards = generate_blog_cards(test_title, test_image_url)
    
    print("\n✅ Generation complete!")
    print(f"Output files: {cards}")