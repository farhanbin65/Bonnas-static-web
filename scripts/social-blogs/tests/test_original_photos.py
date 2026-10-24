"""Offline checks for unchanged photo selection and publishing requests."""
import contextlib
import io
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from original_photos import IMAGES_FILE, image_url, select_original_photo
from social_media_orchestrator import orchestrate_blog_post
from publish import facebook_uploader, instagram_uploader


class OriginalPhotoTests(unittest.TestCase):
    def test_every_library_photo_keeps_its_exact_url(self):
        images = json.loads(IMAGES_FILE.read_text())["local_images"]
        for image in images:
            url = image_url(image)
            self.assertEqual(select_original_photo({"featured_image_url": url}),
                             {"facebook": url, "instagram_square": url})

    def test_manifest_and_uploaders_use_original_without_image_generation(self):
        blog = {"title": "Lamb biryani", "slug": "test", "excerpt": "Test caption", "keywords": ["lamb biryani"]}
        with tempfile.TemporaryDirectory() as directory, contextlib.redirect_stdout(io.StringIO()):
            result = orchestrate_blog_post(blog, directory)
            manifest_path = result["manifest_path"]
            manifest = json.loads(Path(manifest_path).read_text())
            url = manifest["photos"]["facebook"]
            self.assertEqual(url, manifest["photos"]["instagram_square"])
            self.assertTrue(manifest["facebook"]["caption_extended"])
            self.assertTrue(manifest["instagram"]["caption_main"])
            self.assertEqual(list(Path(directory).rglob("*.*")), [Path(manifest_path)])
            response = Mock(ok=True)
            response.json.return_value = {"id": "test-id"}
            environment = {"FACEBOOK_PAGE_ID": "test", "FACEBOOK_ACCESS_TOKEN": "test",
                           "INSTAGRAM_BUSINESS_ACCOUNT_ID": "test", "INSTAGRAM_ACCESS_TOKEN": "test"}
            with patch.dict(os.environ, environment, clear=True), patch.object(facebook_uploader.requests, "post", return_value=response) as post:
                self.assertIsNotNone(facebook_uploader.upload_to_facebook(manifest_path))
                self.assertEqual(post.call_args.kwargs["data"]["url"], url)
                self.assertNotIn("files", post.call_args.kwargs)
            status = Mock()
            status.json.return_value = {"status_code": "FINISHED"}
            with patch.dict(os.environ, environment, clear=True), patch.object(instagram_uploader.requests, "post", return_value=response) as post, patch.object(instagram_uploader.requests, "get", return_value=status), patch.object(instagram_uploader, "host_image") as host:
                self.assertIsNotNone(instagram_uploader.upload_to_instagram(manifest_path))
                self.assertEqual(post.call_args_list[0].kwargs["data"]["image_url"], url)
                host.assert_not_called()


if __name__ == "__main__":
    unittest.main()
