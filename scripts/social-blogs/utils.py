"""Utilities for photo card generation."""
import os
from io import BytesIO
from pathlib import Path
from config import LOGO_PATH, BRAND_PRIMARY, BRAND_TEXT, BRAND_SECONDARY, BRAND_ACCENT
from PIL import Image, ImageDraw, ImageFont
import requests

from config import (
    BRAND_ACCENT,
    BRAND_PRIMARY,
    BRAND_SECONDARY,
    BRAND_TEXT,
    get_padding,
    get_text_sizes,
)


def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


def fetch_image_from_url(url):
    """Fetch image from URL and return PIL Image."""
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        return Image.open(BytesIO(r.content))
    except Exception as e:
        print(f"❌ Failed to fetch image: {e}")
        raise


def resize_image_to_card(image, card_width, card_height):
    """Resize and center-crop image to card dimensions."""
    image.thumbnail((card_width, card_height), Image.Resampling.LANCZOS)
    
    if image.width < card_width or image.height < card_height:
        # Pad if too small
        canvas = Image.new("RGB", (card_width, card_height), hex_to_rgb(BRAND_PRIMARY))
        x = (card_width - image.width) // 2
        y = (card_height - image.height) // 2
        canvas.paste(image, (x, y))
        return canvas
    
    # Crop center if too large
    x = (image.width - card_width) // 2
    y = (image.height - card_height) // 2
    return image.crop((x, y, x + card_width, y + card_height))


def load_font(size):
    """Load font with fallbacks."""
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for path in paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()


def load_logo(width):
    """Load logo from public/logo.png and scale to width."""
    logo_path = Path("public/logo.png")
    if not logo_path.exists():
        print(f"⚠️  Logo not found at {logo_path}")
        return None
    
    logo = Image.open(logo_path).convert("RGBA")
    # Scale logo to 12% of card width
    logo_size = max(int(width * 0.12), 60)
    logo.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)
    return logo


def wrap_text(text, max_width, font):
    """Wrap text to fit within max_width pixels."""
    words = text.split()
    lines = []
    current_line = []
    
    for word in words:
        test_line = " ".join(current_line + [word])
        bbox = ImageDraw.Draw(Image.new("RGB", (1, 1))).textbbox((0, 0), test_line, font=font)
        if bbox[2] > max_width and current_line:
            lines.append(" ".join(current_line))
            current_line = [word]
        else:
            current_line.append(word)
    
    if current_line:
        lines.append(" ".join(current_line))
    
    return lines


def draw_text_overlay(image, title, website, card_width, card_height):
    """Draw semi-transparent overlay + title + website at bottom."""
    sizes = get_text_sizes(card_width)
    padding = get_padding(card_width)
    
    draw = ImageDraw.Draw(image, "RGBA")
    title_font = load_font(sizes["title"])
    website_font = load_font(sizes["website"])
    
    # Wrap title to max 3 lines
    title_lines = wrap_text(title, card_width - 2 * padding, title_font)[:3]
    
    # Calculate text height
    title_height = sum(
        ImageDraw.Draw(Image.new("RGB", (1, 1))).textbbox((0, 0), line, font=title_font)[3]
        for line in title_lines
    ) + padding
    website_height = ImageDraw.Draw(Image.new("RGB", (1, 1))).textbbox((0, 0), website, font=website_font)[3]
    
    overlay_height = title_height + website_height + padding * 2
    
    # Semi-transparent overlay
    overlay_y = card_height - overlay_height
    draw.rectangle(
        [(0, overlay_y), (card_width, card_height)],
        fill=(*hex_to_rgb(BRAND_ACCENT), 200)
    )
    
    # Draw title (max 3 lines)
    y = overlay_y + padding
    for line in title_lines:
        draw.text(
            (padding, y),
            line,
            font=title_font,
            fill=hex_to_rgb(BRAND_TEXT)
        )
        y += ImageDraw.Draw(Image.new("RGB", (1, 1))).textbbox((0, 0), line, font=title_font)[3]
    
    # Draw website
    draw.text(
        (padding, y),
        website,
        font=website_font,
        fill=hex_to_rgb(BRAND_TEXT)
    )


def paste_logo_top_left(image, card_width):
    """Paste logo in top-left corner with padding."""
    logo = load_logo(card_width)
    if logo:
        padding = get_padding(card_width)
        image.paste(logo, (padding, padding), logo)