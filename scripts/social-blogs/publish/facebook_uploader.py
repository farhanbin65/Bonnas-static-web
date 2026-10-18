import json
import os
import sys
import requests
from pathlib import Path
from typing import Optional, Dict

class FacebookUploader:
    """
    Upload photo + caption to Bonna's Facebook Page via Meta Graph API.
    """
    
    def __init__(self, page_id: str, access_token: str):
        """
        Args:
            page_id: Facebook Page ID
            access_token: Facebook Page access token (with publish_pages permission)
        """
        self.page_id = page_id
        self.access_token = access_token
        self.api_version = "v18.0"
        self.graph_url = f"https://graph.facebook.com/{self.api_version}"
    
    def _upload_photo(self, image_path: str) -> Optional[str]:
        """
        Upload image to Facebook and get photo ID.
        
        Args:
            image_path: Path to image file
        
        Returns:
            Photo ID if successful, None otherwise
        """
        if not os.path.exists(image_path):
            print(f"❌ Image not found: {image_path}")
            return None
        
        try:
            with open(image_path, "rb") as f:
                files = {"source": f}
                response = requests.post(
                    f"{self.graph_url}/{self.page_id}/photos",
                    params={
                        "access_token": self.access_token,
                        "published": "false"  # Don't publish yet
                    },
                    files=files,
                    timeout=30
                )
            
            response.raise_for_status()
            photo_id = response.json().get("id")
            
            if photo_id:
                print(f"✅ Photo uploaded: {photo_id}")
                return photo_id
            else:
                print(f"❌ Failed to get photo ID: {response.json()}")
                return None
        
        except Exception as e:
            print(f"❌ Photo upload failed: {e}")
            return None
    
    def post_feed(self, caption: str, image_path: str) -> Optional[str]:
        """
        Create a feed post with photo and caption.
        
        Args:
            caption: Post caption text
            image_path: Path to image file
        
        Returns:
            Post ID if successful, None otherwise
        """
        photo_id = self._upload_photo(image_path)
        if not photo_id:
            return None
        
        try:
            response = requests.post(
                f"{self.graph_url}/{self.page_id}/feed",
                data={
                    "message": caption,
                    "object_attachment": photo_id,
                    "access_token": self.access_token,
                },
                timeout=30
            )
            
            response.raise_for_status()
            post_id = response.json().get("id")
            
            if post_id:
                print(f"✅ Facebook post created: {post_id}")
                return post_id
            else:
                print(f"❌ Failed to create post: {response.json()}")
                return None
        
        except Exception as e:
            print(f"❌ Facebook post failed: {e}")
            return None
    
    def add_comment(self, post_id: str, comment_text: str) -> Optional[str]:
        """
        Add a comment to a post (for blog link).
        
        Args:
            post_id: Facebook post ID
            comment_text: Comment text
        
        Returns:
            Comment ID if successful, None otherwise
        """
        try:
            response = requests.post(
                f"{self.graph_url}/{post_id}/comments",
                data={
                    "message": comment_text,
                    "access_token": self.access_token,
                },
                timeout=30
            )
            
            response.raise_for_status()
            comment_id = response.json().get("id")
            
            if comment_id:
                print(f"✅ Comment added: {comment_id}")
                return comment_id
            else:
                print(f"⚠️  Comment not created: {response.json()}")
                return None
        
        except Exception as e:
            print(f"⚠️  Comment failed: {e}")
            return None


def upload_to_facebook(manifest_path: str) -> Optional[Dict]:
    """
    Upload blog post to Facebook using manifest data.
    
    Args:
        manifest_path: Path to manifest.json created by orchestrator
    
    Returns:
        Dict with post_id and metadata, or None on error
    """
    # Get credentials from env
    page_id = os.getenv("FACEBOOK_PAGE_ID")
    access_token = os.getenv("FACEBOOK_ACCESS_TOKEN")
    
    if not page_id or not access_token:
        print("❌ Missing FACEBOOK_PAGE_ID or FACEBOOK_ACCESS_TOKEN")
        return None
    
    # Load manifest
    if not os.path.exists(manifest_path):
        print(f"❌ Manifest not found: {manifest_path}")
        return None
    
    with open(manifest_path, "r") as f:
        manifest = json.load(f)
    
    uploader = FacebookUploader(page_id, access_token)
    
    print("\n📱 Uploading to Facebook...")
    print("=" * 60)
    
    # Get image and caption
    fb_data = manifest.get("facebook", {})
    photos = manifest.get("photos", {})
    blog_url = fb_data.get("blog_url", "")
    
    fb_image = photos.get("facebook")  # 1200×1200
    if not fb_image:
        print("❌ No Facebook image found in manifest")
        return None
    
    # Use extended caption
    caption = fb_data.get("caption_extended", fb_data.get("caption_standard", ""))
    if not caption:
        print("❌ No caption found in manifest")
        return None
    
    # Post to Facebook
    post_id = uploader.post_feed(caption, fb_image)
    
    if post_id:
        # Add blog link as comment
        if blog_url:
            comment_text = f"Read the full blog: {blog_url}"
            uploader.add_comment(post_id, comment_text)
        
        print("\n✅ Facebook upload successful!")
        return {
            "platform": "facebook",
            "post_id": post_id,
            "url": f"https://facebook.com/{post_id}",
        }
    else:
        print("\n❌ Facebook upload failed")
        return None


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Upload blog to Facebook")
    parser.add_argument("--manifest", required=True, help="Path to manifest.json")
    args = parser.parse_args()
    
    result = upload_to_facebook(args.manifest)
    if result:
        print(json.dumps(result, indent=2))
        sys.exit(0)
    else:
        sys.exit(1)