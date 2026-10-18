import os
from PIL import Image, ImageDraw, ImageFont
import requests
from io import BytesIO
from config import LOGO_PATH, BRAND_PRIMARY, BRAND_TEXT, BRAND_SECONDARY

# ─── Image Helpers ──────────────────────────────────────────────
def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def crop_to_square_center(image):
    """Crop image to square from center, maintaining aspect ratio."""
    w, h = image.size
    if w == h:
        return image
    
    size = min(w, h)
    left = (w - size) // 2
    top = (h - size) // 2
    return image.crop((left, top, left + size, top + size))

def fetch_image_from_url(url):
    """Fetch image from URL and return PIL Image object."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
        return img
    except Exception as e:
        print(f"⚠️  Failed to fetch image: {e}")
        return None

def resize_image_to_card(image, card_width, card_height):
    """
    Resize and center image to fill card without distortion.
    Crops excess if aspect ratio differs.
    """
    img_w, img_h = image.size
    card_ratio = card_width / card_height
    img_ratio = img_w / img_h
    
    if img_ratio > card_ratio:
        # Image is wider than card, crop width
        new_h = img_h
        new_w = int(img_h * card_ratio)
        left = (img_w - new_w) // 2
        image = image.crop((left, 0, left + new_w, img_h))
    else:
        # Image is taller than card, crop height
        new_w = img_w
        new_h = int(img_w / card_ratio)
        top = (img_h - new_h) // 2
        image = image.crop((0, top, img_w, top + new_h))
    
    return image.resize((card_width, card_height), Image.LANCZOS)

def load_font(size, bold=False):
    """Load system font with fallback."""
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for path in paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except:
                continue
    return ImageFont.load_default()

# ─── Logo & Branding ────────────────────────────────────────────
def load_logo(size):
    """Load and resize logo for placement."""
    if not os.path.exists(LOGO_PATH):
        print(f"⚠️  Logo not found at {LOGO_PATH}")
        return None
    
    try:
        logo = Image.open(LOGO_PATH).convert("RGBA")
        logo.thumbnail((size, size), Image.LANCZOS)
        return logo
    except Exception as e:
        print(f"⚠️  Failed to load logo: {e}")
        return None

def wrap_text(text, font, max_width, draw):
    """
    Wrap text to fit within max_width.
    Returns list of lines.
    """
    words = text.split()
    lines = []
    current_line = []
    
    for word in words:
        test_line = " ".join(current_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=font)
        if bbox[2] <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(" ".join(current_line))
            current_line = [word]
    
    if current_line:
        lines.append(" ".join(current_line))
    
    return lines

# ─── Overlay & Text ─────────────────────────────────────────────
def draw_text_overlay(image, title, website_text, card_config):
    """
    Draw semi-transparent white box with title and website at bottom.
    """
    draw = ImageDraw.Draw(image, "RGBA")
    
    width, height = image.size
    padding = card_config["padding"]
    text_sizes = card_config["text_sizes"]
    
    # Title font
    title_font = load_font(text_sizes["title"], bold=True)
    website_font = load_font(text_sizes["website"])
    
    # Wrap title text
    max_text_width = width - (padding["horizontal"] * 2)
    title_lines = wrap_text(title, title_font, max_text_width, draw)
    
    # Limit to 2 lines max
    title_lines = title_lines[:2]
    
    # Calculate overlay box height
    line_height = int(text_sizes["title"] * 1.4)
    overlay_height = (len(title_lines) * line_height) + (padding["vertical"] * 2)
    website_height = int(text_sizes["website"] * 1.3)
    
    overlay_height += website_height + padding["vertical"]
    
    # Draw semi-transparent white box at bottom
    overlay_y = height - overlay_height
    draw.rectangle(
        [(0, overlay_y), (width, height)],
        fill=(255, 255, 255, 220)  # 86% opacity white
    )
    
    # Draw title text
    y_pos = overlay_y + padding["vertical"]
    for line in title_lines:
        draw.text(
            (padding["horizontal"], y_pos),
            line,
            font=title_font,
            fill=hex_to_rgb(BRAND_TEXT)
        )
        y_pos += line_height
    
    # Draw website text
    y_pos += padding["vertical"] // 2
    draw.text(
        (padding["horizontal"], y_pos),
        website_text,
        font=website_font,
        fill=hex_to_rgb(BRAND_ACCENT)
    )

def paste_logo_top_left(image, logo, padding=20):
    """
    Paste logo in top-left corner with padding.
    """
    if logo is None:
        return
    
    image.paste(logo, (padding, padding), logo)