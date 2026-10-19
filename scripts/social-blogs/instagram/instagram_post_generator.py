"""Generate Instagram captions."""


class InstagramCaptionGenerator:
    def __init__(self, blog_data):
        self.blog_data = blog_data
        self.title = blog_data.get("title", "")
        self.slug = blog_data.get("slug", "")
        self.excerpt = blog_data.get("excerpt", "")

    def generate_caption_main(self):
        """Main feed caption with link-in-bio CTA."""
        caption = f"{self.title}\n\n{self.excerpt}\n\n"
        caption += "🔗 Link in bio for full recipe!\n\n"
        
        hashtags = " ".join([
            "#BonnasKitchen",
            "#TraditionalBiryani",
            "#AuthenticCuisine",
            "#BethinalGreen",
            "#LondonFood",
            "#HomeCooked",
            "#RecipeOfTheDay",
            "#FoodBlogger",
            "#EasyRecipes",
            "#FamilyRecipes",
            "#CozyFood",
            "#FoodPhotography",
            "#InstafoodDaily",
            "#YumRecipes",
            "#HealthyEating",
            "#ComfortFood",
            "#FoodCulture",
            "#TraditionalFood",
            "#CookingAtHome",
            "#FoodLovers",
            "#BiryaniBest",
            "#AuthenticFlavors",
            "#KitchenStories",
            "#FoodIsLife",
            "#ShareYourMeal",
        ])
        
        return caption + hashtags

    def generate_caption_story(self):
        """Story caption with brand narrative."""
        return "New recipe on the blog! Check it out 👆 Link in bio 🍲"


def generate_instagram_caption(blog_data):
    """Standalone function."""
    gen = InstagramCaptionGenerator(blog_data)
    return {
        "caption_main": gen.generate_caption_main(),
        "caption_story": gen.generate_caption_story(),
    }