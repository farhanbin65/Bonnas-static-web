"""Generate branded photo cards for social media."""
import json
from pathlib import Path

from PIL import Image

from config import CARD_SIZES, OUTPUT_DIR
from utils import (
    draw_text_overlay,
    fetch_image_from_url,
    paste_logo_top_left,
    resize_image_to_card,
)


class PhotoCardGenerator:
    def __init__(self, blog_title, featured_image_url, output_base):
        self.blog_title = blog_title
        self.featured_image_url = featured_image_url
        self.output_base = Path(output_base)
        self.output_base.mkdir(parents=True, exist_ok=True)

    def _load_image(self):
        """Fetch and prepare base image."""
        return fetch_image_from_url(self.featured_image_url)

    def _generate_card(self, size_key):
        """Generate card for a specific size."""
        if size_key not in CARD_SIZES:
            raise ValueError(f"Unknown size: {size_key}")
        
        width, height = CARD_SIZES[size_key]
        image = self._load_image()
        image = resize_image_to_card(image, width, height)
        
        draw_text_overlay(image, self.blog_title, "bonnas.co.uk", width, height)
        paste_logo_top_left(image, width)
        
        output_path = self.output_base / f"{size_key}.jpg"
        image = image.convert("RGB")
        image.save(output_path, "JPEG", quality=95)
        print(f"✅ Card generated: {output_path}")
        return str(output_path)

    def generate_all(self):
        """Generate all card sizes."""
        cards = {}
        for size_key in CARD_SIZES:
            cards[size_key] = self._generate_card(size_key)
        return cards

    def generate_single(self, size_key):
        """Generate single card size."""
        return self._generate_card(size_key)


def generate_blog_cards(blog_title, featured_image_url, output_base):
    """Standalone function to generate all cards."""
    generator = PhotoCardGenerator(blog_title, featured_image_url, output_base)
    return generator.generate_all()