import json
import re
from typing import Dict, List

class InstagramCaptionGenerator:
    """
    Generate Instagram captions for Bonna's blog posts.
    Includes emojis, hashtags, and "link in bio" CTA.
    """
    
    def __init__(self, blog_title: str, excerpt: str, keywords: List[str],
                 slug: str, website: str = "bonnas.co.uk", handle: str = "@BonnasKitchen"):
        """
        Args:
            blog_title: Blog post title
            excerpt: Blog excerpt
            keywords: List of keywords
            slug: Blog slug
            website: Website domain
            handle: Instagram handle
        """
        self.blog_title = blog_title
        self.excerpt = excerpt
        self.keywords = keywords
        self.slug = slug
        self.website = website
        self.handle = handle
        self.blog_url = f"https://{website}/{slug}"
    
    def _clean_text(self, text: str) -> str:
        """Remove markdown and extra whitespace."""
        text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
        text = re.sub(r'\*(.+?)\*', r'\1', text)
        text = re.sub(r'#+\s+', '', text)
        return text.strip()
    
    def _emoji_for_content(self) -> str:
        """Choose emoji based on content type."""
        title_lower = self.blog_title.lower()
        
        if any(word in title_lower for word in ["recipe", "cook", "how to"]):
            return "👨‍🍳"
        elif any(word in title_lower for word in ["wedding", "catering", "event"]):
            return "💍"
        elif any(word in title_lower for word in ["street food", "snack"]):
            return "🥘"
        elif any(word in title_lower for word in ["biryani", "rice", "polao"]):
            return "🍚"
        elif any(word in title_lower for word in ["curry", "korma"]):
            return "🍛"
        else:
            return "🍳"
    
    def _extract_hashtags(self) -> List[str]:
        """Extract hashtags optimized for Instagram discovery."""
        hashtags = []
        
        # Primary keywords
        for keyword in self.keywords[:2]:
            tag = keyword.lower().replace(" ", "")
            if len(tag) > 2:
                hashtags.append(f"#{tag}")
        
        # Brand hashtags
        brand_tags = [
            "#BonnasKitchen",
            "#HalalBangladeshiFood",
            "#LondonFoodBlogger",
            "#BethanalGreen",
            "#HalalCatering",
            "#FoodBlogger",
            "#BangladeshiCuisine",
            "#AuthenticFood",
            "#PreOrderFood",
            "#HomeCooked",
        ]
        
        # Content-specific
        if any(word in self.blog_title.lower() for word in ["recipe", "cook"]):
            brand_tags.append("#FoodRecipe")
        
        if any(word in self.blog_title.lower() for word in ["wedding", "event", "catering"]):
            brand_tags.append("#EventCatering")
        
        hashtags.extend(brand_tags[:20])  # Instagram allows ~30 max
        
        # Remove duplicates
        hashtags = list(dict.fromkeys(hashtags))
        return hashtags[:25]  # Stay within Instagram's soft limit
    
    def generate_caption(self) -> Dict[str, str]:
        """
        Generate Instagram caption with link-in-bio CTA.
        
        Returns:
            dict with caption variants
        """
        excerpt_clean = self._clean_text(self.excerpt)
        emoji = self._emoji_for_content()
        hashtags = self._extract_hashtags()
        hashtag_str = " ".join(hashtags)
        
        # Instagram caption (concise, emoji-rich)
        caption = f"""{emoji} {self.blog_title}

{excerpt_clean}

🔗 Link in bio to read the full recipe & pre-order fresh!

📍 Collection from E2 0RB
⏰ 2 days notice
✅ 100% Halal

{hashtag_str}"""
        
        # Alternative caption (storytelling angle)
        caption_story = f"""{emoji} New on the blog!

{self.blog_title}

Every dish we cook is made fresh to order with love and tradition. No shortcuts, just authentic flavors.

{excerpt_clean}

Ready to order? Link in bio! {self.handle}

{hashtag_str}"""
        
        return {
            "platform": "instagram",
            "caption": caption,
            "caption_story": caption_story,
            "hashtags": hashtags,
            "cta": "Link in bio",
            "emoji": emoji,
        }


def generate_instagram_caption(blog_data: Dict) -> Dict:
    """
    Quick function to generate Instagram caption from blog data.
    
    Args:
        blog_data: Dict with title, excerpt, keywords, slug
    
    Returns:
        Dict with caption variants
    
    Example:
        caption = generate_instagram_caption({
            "title": "Chicken Biryani Recipe",
            "excerpt": "Learn to cook...",
            "keywords": ["biryani", "recipe"],
            "slug": "chicken-biryani-recipe"
        })
    """
    generator = InstagramCaptionGenerator(
        blog_title=blog_data["title"],
        excerpt=blog_data["excerpt"],
        keywords=blog_data.get("keywords", []),
        slug=blog_data["slug"]
    )
    return generator.generate_caption()


if __name__ == "__main__":
    # Test example
    test_blog = {
        "title": "Chicken Biryani Recipe",
        "excerpt": "Learn to cook authentic Bangladeshi chicken biryani with this step-by-step guide.",
        "keywords": ["chicken biryani", "bangladeshi recipe", "rice dish"],
        "slug": "chicken-biryani-recipe"
    }
    
    caption = generate_instagram_caption(test_blog)
    print("📸 Instagram Caption (Main):")
    print("=" * 60)
    print(caption["caption"])
    print("\n📸 Instagram Caption (Story Angle):")
    print("=" * 60)
    print(caption["caption_story"])
    print("\n🏷️  Hashtags:")
    print(f"Total: {len(caption['hashtags'])} tags")
    print(" ".join(caption["hashtags"]))