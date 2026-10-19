"""Brand constants and card configuration."""

BRAND_PRIMARY = "#E8C5C5"      # Soft pink
BRAND_SECONDARY = "#FFFFFF"    # White
BRAND_TEXT = "#2C1B1B"         # Dark brown
BRAND_ACCENT = "#D4A5A5"       # Muted pink

CARD_SIZES = {
    "facebook": (1200, 1200),
    "instagram_square": (1080, 1080),
    # Removed: "instagram_stories": (1080, 1920)
}

OUTPUT_DIR = "output/cards"


def get_text_sizes(width):
    """Return font sizes scaled to card width."""
    return {
        "title": max(int(width * 0.06), 24),
        "website": max(int(width * 0.03), 14),
    }


def get_padding(width):
    """Return padding scaled to card width."""
    return max(int(width * 0.05), 40)