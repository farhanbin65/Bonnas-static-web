"""Generate Instagram captions."""


class InstagramCaptionGenerator:
    def __init__(self, blog_data):
        self.blog_data = blog_data
        self.title = blog_data.get("title", "")
        self.slug = blog_data.get("slug", "")
        self.excerpt = blog_data.get("excerpt", "")

    def generate_caption_main(self):
        """Generate caption from blog excerpt + hashtags."""
        excerpt = self.blog_data.get("excerpt", "")
        
        caption = f"{excerpt}\n\n"
        caption += "🔗 Link in bio to read the full recipe & pre-order fresh!\n\n"
        caption += "#BonnasFood #BangladeshiCuisine #AuthenticFood #BethnalGreen\n"
        caption += "@bonnas_cuisine"
        
        return caption

    def generate_caption_story(self):
        """Story caption with brand narrative."""
        return "New recipe on the blog! Check it out 👆 Link in bio 🍲"


def generate_instagram_caption(blog_data):
    """Generate Instagram captions (called by orchestrator)."""
    generator = InstagramCaptionGenerator(blog_data)
    
    return {
        "caption": generator.generate_caption_main(),
        "caption_story": generator.generate_caption_story(),
        "hashtags": "#BonnasFood #BangladeshiCuisine #AuthenticFood #BethnalGreen",
        "cta": "🔗 Link in bio to read the full recipe & pre-order fresh!",
        "emoji": "🍲",
    }