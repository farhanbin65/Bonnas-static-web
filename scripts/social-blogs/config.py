import os
from pathlib import Path

# ─── Brand Colors ───────────────────────────────────────────────
BRAND_PRIMARY = "#E8C5C5"      # Soft pink
BRAND_SECONDARY = "#FFFFFF"   # White overlay box
BRAND_TEXT = "#2C1B1B"        # Dark brown/charcoal
BRAND_ACCENT = "#D4A5A5"      # Deeper pink for accents

# ─── Logo & Assets ───────────────────────────────────────────────
LOGO_PATH = "public/logo.png"
WEBSITE = "bonnas.co.uk"
HANDLE = "@BonnasKitchen"

# ─── Card Dimensions ────────────────────────────────────────────
CARD_SIZES = {
    "instagram_square": (1080, 1080),
    "facebook": (1200, 1200),
    "instagram_stories": (1080, 1920),
}

# ─── Output Directory ───────────────────────────────────────────
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "output", "cards")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ─── Text Sizing (scales with card dimensions) ──────────────────
def get_text_sizes(width):
    """Returns font sizes relative to card width."""
    return {
        "title": int(width * 0.08),        # ~86px for 1080w
        "website": int(width * 0.045),     # ~48px for 1080w
    }

def get_padding(width):
    """Returns padding relative to card width."""
    return {
        "horizontal": int(width * 0.06),   # 60px for 1080w
        "vertical": int(width * 0.05),     # 50px for 1080w
    }