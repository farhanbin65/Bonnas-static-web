import json
import os
import sys
import requests
from pathlib import Path
from typing import Optional, Dict

class InstagramUploader:
    """
    Upload photo + caption to Bonna's Instagram Business Account via Meta Graph API.
    """
    
    def __init__(self, business_account_id: str, access_token: str):
        """
        Args:
            business_account_id: Instagram Business Account ID
            access_token: Instagram access token (with instagram_basic + pages_read_engagement + pages_manage_metadata + instagram_content_publish)
        """
        self.business_account_id = business_account_id
        self.access_token = access_token
        self.api_version = "v18.0"
        self.graph_url = f"https://graph.facebook.com/{self.api_version}"
    
    def _create_media_container(self, image_path: str, caption: str) -> Optional[str]:
        """
        Create a media container for the image.
        
        Args:
            image_path: Path to image file
            caption: Post caption
        
        Returns:
            Container ID if successful, None otherwise
        """
        if not os.path.exists(image_path):
            print(f"❌ Image not found: {image_path}")
            return None
        
        try:
            with open(image_path, "rb") as f:
                files = {"image_url": ("image.png", f, "image/png")}
                
                # For Instagram, we need to use image_url (URL) not direct file upload
                # So we'll upload to a temporary location first (or use Unsplash URLs)
                # For now, we'll use requests-toolbelt for multipart
                
                response = requests.post(
                    f"{self.graph_url}/{self.business_account_id}/media",
                    data={
                        "image_url": self._upload_temp_image(image_path),
                        "caption": caption,
                        "access_token": self.access_token,
                    },
                    timeout=30
                )
            
            response.raise_for_status()
            container_id = response.json().get("id")
            
            if container_id:
                print(f"✅ Media container created: {container_id}")
                return container_id
            else:
                print(f"❌ Failed to create container: {response.json()}")
                return None
        
        except Exception as e:
            print(f"❌ Container creation failed: {e}")
            return None
    
    def _upload_temp_image(self, image_path: str) -> str:
        """
        Upload image to temporary storage and get URL.
        For now, we'll save locally and reference it.
        In production, use S3 or similar.
        
        Args:
            image_path: Path to image
        
        Returns:
            URL to image
        """
        # For GitHub Actions, we can use the artifact or upload to a service
        # For simplicity, we'll return the local path
        # In production, upload to S3/Cloudinary and return that URL
        return f"file://{os.path.abspath(image_path)}"
    
    def post_feed(self, caption: str, image_path: str, hashtags: list = None) -> Optional[str]:
        """
        Create a carousel or feed post.
        
        Args:
            caption: Post caption
            image_path: Path to image file
            hashtags: List of hashtags (will be appended to caption)
        
        Returns:
            Post ID if successful, None otherwise
        """
        # Append hashtags to caption
        full_caption = caption
        if hashtags:
            hashtag_str = " ".join(hashtags)
            full_caption = f"{caption}\n\n{hashtag_str}"
        
        try:
            # Create media container
            container_id = self._create_media_container(image_path, full_caption)
            if not container_id:
                return None
            
            # Publish container
            response = requests.post(
                f"{self.graph_url}/{self.business_account_id}/media_publish",
                data={
                    "creation_id": container_id,
                    "access_token": self.access_token,
                },
                timeout=30
            )
            
            response.raise_for_status()
            post_id = response.json().get("id")
            
            if post_id:
                print(f"✅ Instagram post published: {post_id}")
                return post_id
            else:
                print(f"❌ Failed to publish: {response.json()}")
                return None
        
        except Exception as e:
            print(f"❌ Instagram post failed: {e}")
            return None


def upload_to_instagram(manifest_path: str) -> Optional[Dict]:
    """
    Upload blog post to Instagram using manifest data.
    
    Args:
        manifest_path: Path to manifest.json created by orchestrator
    
    Returns:
        Dict with post_id and metadata, or None on error
    """
    # Get credentials from env
    business_account_id = os.getenv("INSTAGRAM_BUSINESS_ACCOUNT_ID")
    access_token = os.getenv("INSTAGRAM_ACCESS_TOKEN")
    
    if not business_account_id or not access_token:
        print("❌ Missing INSTAGRAM_BUSINESS_ACCOUNT_ID or INSTAGRAM_ACCESS_TOKEN")
        return None
    
    # Load manifest
    if not os.path.exists(manifest_path):
        print(f"❌ Manifest not found: {manifest_path}")
        return None
    
    with open(manifest_path, "r") as f:
        manifest = json.load(f)
    
    uploader = InstagramUploader(business_account_id, access_token)
    
    print("\n📸 Uploading to Instagram...")
    print("=" * 60)
    
    # Get image and caption
    ig_data = manifest.get("instagram", {})
    photos = manifest.get("photos", {})
    
    ig_image = photos.get("instagram_square")  # 1080×1080
    if not ig_image:
        print("❌ No Instagram image found in manifest")
        return None
    
    # Use main caption
    caption = ig_data.get("caption_main", "")
    hashtags = ig_data.get("hashtags", [])
    
    if not caption:
        print("❌ No caption found in manifest")
        return None
    
    # Post to Instagram
    post_id = uploader.post_feed(caption, ig_image, hashtags)
    
    if post_id:
        print("\n✅ Instagram upload successful!")
        return {
            "platform": "instagram",
            "post_id": post_id,
            "url": f"https://instagram.com/p/{post_id}",
        }
    else:
        print("\n❌ Instagram upload failed")
        return None


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Upload blog to Instagram")
    parser.add_argument("--manifest", required=True, help="Path to manifest.json")
    args = parser.parse_args()
    
    result = upload_to_instagram(args.manifest)
    if result:
        print(json.dumps(result, indent=2))
        sys.exit(0)
    else:
        sys.exit(1)