"""Generate Facebook captions."""


class FacebookCaptionGenerator:
    def __init__(self, blog_data):
        self.blog_data = blog_data
        self.title = blog_data.get("title", "")
        self.slug = blog_data.get("slug", "")
        self.excerpt = blog_data.get("excerpt", "")

    def generate_extended_caption(self):
        """Extended caption with blog link."""
        blog_url = f"https://www.bonnas.co.uk/blog/{self.slug}"
        hashtags = " ".join([
            "#BonnasKitchen",
            "#TraditionalBiryani",
            "#AuthenticCuisine",
            "#BethinalGreen",
            "#LondonFood",
            "#HomeCooked",
        ])
        return f"{self.title}\n\n{self.excerpt}\n\n🔗 Read full recipe: {blog_url}\n\n{hashtags}"

    def generate_standard_caption(self):
        """Shorter caption."""
        hashtags = " ".join([
            "#BonnasKitchen",
            "#TraditionalBiryani",
            "#AuthenticCuisine",
        ])
        return f"{self.title}\n\n{self.excerpt}\n\n{hashtags}"


def generate_facebook_caption(blog_data):
    """Standalone function."""
    gen = FacebookCaptionGenerator(blog_data)
    return {
        "caption_extended": gen.generate_extended_caption(),
        "caption_standard": gen.generate_standard_caption(),
    }