import json
import re
from typing import Dict, List

class FacebookCaptionGenerator:
    """
    Generate Facebook captions for Bonna's blog posts.
    Includes hashtags, CTA, and collection info.
    """
    
    def __init__(self, blog_title: str, excerpt: str, keywords: List[str], 
                 slug: str, website: str = "bonnas.co.uk"):
        """
        Args:
            blog_title: Blog post title
            excerpt: Blog excerpt (50-160 chars)
            keywords: List of keywords from blog
            slug: Blog slug for URL
            website: Website domain
        """
        self.blog_title = blog_title
        self.excerpt = excerpt
        self.keywords = keywords
        self.slug = slug
        self.website = website
        self.blog_url = f"https://{website}/{slug}"
    
    def _clean_text(self, text: str) -> str:
        """Remove markdown and extra whitespace."""
        text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)  # Bold
        text = re.sub(r'\*(.+?)\*', r'\1', text)      # Italic
        text = re.sub(r'#+\s+', '', text)              # Headers
        return text.strip()
    
    def _extract_hashtags(self) -> List[str]:
        """Extract relevant hashtags from keywords and content."""
        hashtags = []
        
        # Primary hashtags from keywords
        for keyword in self.keywords[:3]:
            # Convert multi-word keywords to hashtags
            tag = keyword.lower().replace(" ", "")
            if len(tag) > 2:
                hashtags.append(f"#{tag}")
        
        # Brand hashtags
        hashtags.extend([
            "#BonnasKitchen",
            "#HalalFood",
            "#BangladeshiFood",
            "#LondonFood",
            "#E2",
        ])
        
        # Content-specific hashtags
        if any(word in self.blog_title.lower() for word in ["recipe", "cook", "how to"]):
            hashtags.append("#FoodRecipe")
        
        if any(word in self.blog_title.lower() for word in ["catering", "wedding", "event"]):
            hashtags.append("#Catering")
        
        if any(word in self.blog_title.lower() for word in ["street food", "snack", "appetizer"]):
            hashtags.append("#StreetFood")
        
        # Remove duplicates, limit to 10 for Facebook
        hashtags = list(dict.fromkeys(hashtags))
        return hashtags[:10]
    
    def generate_caption(self) -> Dict[str, str]:
        """
        Generate Facebook caption with multiple format options.
        
        Returns:
            dict with 'standard', 'extended', and 'hashtags' keys
        """
        excerpt_clean = self._clean_text(self.excerpt)
        hashtags = self._extract_hashtags()
        hashtag_str = " ".join(hashtags)
        
        # Standard caption (short, engagement-focused)
        standard = f"""🍳 {self.blog_title}

{excerpt_clean}

Pre-order fresh at bonnas.co.uk — collection only, 2 days notice required.

{hashtag_str}"""
        
        # Extended caption (with more details)
        extended = f"""🍳 {self.blog_title}

{excerpt_clean}

Learn more on our blog and order fresh at:
{self.blog_url}

📍 Collection only from E2 0RB, Bethnal Green
⏰ Pre-order with 2 days notice
✅ 100% Halal
🎉 Perfect for families, events & catering

{hashtag_str}"""
        
        return {
            "platform": "facebook",
            "standard": standard,
            "extended": extended,
            "hashtags": hashtags,
            "blog_url": self.blog_url,
            "cta": "Order at bonnas.co.uk",
        }


def generate_facebook_caption(blog_data: Dict) -> Dict:
    """
    Quick function to generate Facebook caption from blog data.
    
    Args:
        blog_data: Dict with title, excerpt, keywords, slug
    
    Returns:
        Dict with caption variants
    
    Example:
        caption = generate_facebook_caption({
            "title": "Chicken Biryani Recipe",
            "excerpt": "Learn to cook...",
            "keywords": ["biryani", "recipe"],
            "slug": "chicken-biryani-recipe"
        })
    """
    generator = FacebookCaptionGenerator(
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
    
    caption = generate_facebook_caption(test_blog)
    print("📱 Facebook Caption (Standard):")
    print("=" * 60)
    print(caption["standard"])
    print("\n📱 Facebook Caption (Extended):")
    print("=" * 60)
    print(caption["extended"])
    print("\n🏷️  Hashtags:")
    print(", ".join(caption["hashtags"]))