import json
from datetime import datetime
from typing import Dict, Optional

from original_photos import select_original_photo
from facebook.facebook_post_generator import generate_facebook_caption
from instagram.instagram_post_generator import generate_instagram_caption


class SocialMediaOrchestrator:
    """
    Main orchestrator for automating blog-to-social-media publishing.
    Selects unchanged original photos + generates captions for Facebook & Instagram.
    """
    
    def __init__(self, blog_data: Dict):
        self.blog_data = blog_data
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.post_id = f"{self.blog_data['slug']}_{self.timestamp}"
    
    def _validate_blog_data(self) -> bool:
        """Validate required fields in blog data."""
        required = ["title", "excerpt", "keywords", "slug"]
        missing = [f for f in required if f not in self.blog_data]
        
        if missing:
            print(f"❌ Missing required fields: {', '.join(missing)}")
            return False
        return True
    
    def _generate_photos(self) -> Dict[str, str]:
        """Use one original library photo on both platforms without editing it."""
        photos = select_original_photo(self.blog_data)
        print(f"\n📸 Using original photo: {photos['facebook']}")
        return photos

    def _generate_facebook_post(self) -> Dict:
        """Generate Facebook caption and metadata."""
        print("\n📱 Generating Facebook post...")
        
        try:
            caption_data = generate_facebook_caption(self.blog_data)
            
            facebook_post = {
                "platform": "facebook",
                "caption_standard": caption_data["caption_standard"],
                "caption_extended": caption_data["caption_extended"],
                "hashtags": caption_data.get("hashtags", []),
                "blog_url": f"https://www.bonnas.co.uk/blog/{self.blog_data['slug']}",
                "cta": caption_data.get("cta", "Read the full blog"),
                "image_size": "original",
            }
            
            print(f"✅ Facebook post generated")
            return facebook_post
        except Exception as e:
            print(f"❌ Facebook post generation failed: {e}")
            return {}
    
    def _generate_instagram_post(self) -> Dict:
        """Generate Instagram caption and metadata."""
        print("\n📸 Generating Instagram post...")
        
        try:
            caption_data = generate_instagram_caption(self.blog_data)
            
            instagram_post = {
                "platform": "instagram",
                "caption_main": caption_data["caption"],
                "caption_story": caption_data["caption_story"],
                "hashtags": caption_data["hashtags"],
                "cta": caption_data["cta"],
                "emoji": caption_data["emoji"],
                "image_size": "original",
            }
            
            print(f"✅ Instagram post generated")
            return instagram_post
        except Exception as e:
            print(f"❌ Instagram post generation failed: {e}")
            return {}
    
    def _build_manifest(self, photos: Dict, fb_post: Dict, ig_post: Dict) -> Dict:
        """Return the payload directly; no output files or directories are needed."""
        return {
            "post_id": self.post_id,
            "timestamp": self.timestamp,
            "blog": self.blog_data,
            "photos": photos,
            "facebook": fb_post,
            "instagram": ig_post,
            "status": "ready_to_publish",
        }

    def orchestrate(self) -> Optional[Dict]:
        """
        Run the complete automation pipeline.
        
        Returns:
            Dict with all generated posts and metadata, or None on error
        """
        print("=" * 70)
        print(f"🚀 Social Media Orchestrator - {self.post_id}")
        print("=" * 70)
        
        # Validate
        if not self._validate_blog_data():
            return None
        
        print(f"\n📝 Blog: {self.blog_data['title']}")
        print(f"📍 Slug: {self.blog_data['slug']}")
        
        # Generate all content
        photos = self._generate_photos()
        fb_post = self._generate_facebook_post()
        ig_post = self._generate_instagram_post()
        
        if not fb_post or not ig_post:
            return None

        result = self._build_manifest(photos, fb_post, ig_post)

        print("\n" + "=" * 70)
        print("✅ All content generated successfully!")
        print("=" * 70)
        
        return result


def orchestrate_blog_post(blog_data: Dict) -> Optional[Dict]:
    """
    Quick function to automate entire blog-to-social workflow.
    
    Args:
        blog_data: Dict with title, excerpt, featured_image_url, keywords, slug
    
    Returns:
        Dict with all generated posts, or None on error
    
    Example:
        result = orchestrate_blog_post({
            "title": "Chicken Biryani Recipe",
            "excerpt": "Learn to cook...",
            "featured_image_url": "https://...",
            "keywords": ["biryani", "recipe"],
            "slug": "chicken-biryani-recipe"
        })
        
        if result:
            print(f"Post ID: {result['post_id']}")
            print(f"Photos: {result['photos']}")
            print(f"Facebook caption: {result['facebook']['caption_standard']}")
            print(f"Instagram caption: {result['instagram']['caption_main']}")
    """
    orchestrator = SocialMediaOrchestrator(blog_data)
    return orchestrator.orchestrate()


if __name__ == "__main__":
    # Test example
    test_blog = {
        "title": "Chicken Biryani Recipe",
        "excerpt": "Learn to cook authentic Bangladeshi chicken biryani with this step-by-step guide.",
        "featured_image_url": "https://images.unsplash.com/photo-1568150950473-9546926281c2?w=1200",
        "keywords": ["chicken biryani", "bangladeshi recipe", "rice dish"],
        "slug": "chicken-biryani-recipe"
    }
    
    result = orchestrate_blog_post(test_blog)
    
    if result:
        print("\n📊 Result Summary:")
        print(json.dumps({
            "post_id": result["post_id"],
            "photos_generated": len(result["photos"]),
            "facebook_ready": bool(result["facebook"]),
            "instagram_ready": bool(result["instagram"]),
        }, indent=2))