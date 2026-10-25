"""Offline checks for unchanged photo selection and publishing requests."""
import contextlib
import io
import json
import os
from pathlib import Path
import sys
import subprocess
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
            with patch("builtins.print"):
                manifest = orchestrate_blog_post(blog)
            self.assertNotIn("manifest_path", manifest)
            url = manifest["photos"]["facebook"]
            self.assertEqual(url, manifest["photos"]["instagram_square"])
            self.assertTrue(manifest["facebook"]["caption_extended"])
            self.assertTrue(manifest["instagram"]["caption_main"])
            self.assertEqual(list(Path(directory).rglob("*")), [])
            response = Mock(ok=True)
            response.json.return_value = {"id": "test-id"}
            environment = {"FACEBOOK_PAGE_ID": "test", "FACEBOOK_ACCESS_TOKEN": "test",
                           "INSTAGRAM_BUSINESS_ACCOUNT_ID": "test", "INSTAGRAM_ACCESS_TOKEN": "test",
                           "SOCIAL_MANIFEST_JSON": json.dumps(manifest)}
            with patch.dict(os.environ, environment, clear=True), patch.object(facebook_uploader.requests, "post", return_value=response) as post:
                self.assertIsNotNone(facebook_uploader.upload_to_facebook())
                self.assertEqual(post.call_args.kwargs["data"]["url"], url)
                self.assertNotIn("files", post.call_args.kwargs)
            status = Mock()
            status.json.return_value = {"status_code": "FINISHED"}
            with patch.dict(os.environ, environment, clear=True), patch.object(instagram_uploader.requests, "post", return_value=response) as post, patch.object(instagram_uploader.requests, "get", return_value=status), patch.object(instagram_uploader, "host_image") as host:
                self.assertIsNotNone(instagram_uploader.upload_to_instagram())
                self.assertEqual(post.call_args_list[0].kwargs["data"]["image_url"], url)
                host.assert_not_called()

    def test_cli_emits_one_json_line_and_diagnostics_on_stderr(self):
        script = Path(__file__).resolve().parents[1] / "generate_social_content.py"
        with tempfile.TemporaryDirectory() as directory:
            blog = Path(directory) / "blog.json"
            excerpt = 'বাংলা খাবার\n"quoted" $(literal) `literal`'
            blog.write_text(json.dumps({"title": "Biryani", "slug": "test", "excerpt": excerpt, "keywords": []}))
            result = subprocess.run([sys.executable, str(script), "--blog-data", str(blog)], cwd=directory, capture_output=True, text=True, check=True)
            self.assertEqual(len(result.stdout.splitlines()), 1)
            manifest = json.loads(result.stdout)
            self.assertEqual(manifest["blog"]["excerpt"], excerpt)
            self.assertIn("Using original photo", result.stderr)
            self.assertEqual(list(Path(directory).iterdir()), [blog])

    def test_invalid_env_payloads_fail_before_network_calls(self):
        for payload in [None, "not json", "[]", "{}", '{"photos":null,"facebook":{},"instagram":{}}']:
            environment = {"FACEBOOK_PAGE_ID": "test", "FACEBOOK_ACCESS_TOKEN": "test", "INSTAGRAM_BUSINESS_ACCOUNT_ID": "test", "INSTAGRAM_ACCESS_TOKEN": "test"}
            if payload is not None:
                environment["SOCIAL_MANIFEST_JSON"] = payload
            with patch.dict(os.environ, environment, clear=True), patch.object(facebook_uploader.requests, "post") as post, contextlib.redirect_stdout(io.StringIO()):
                self.assertIsNone(facebook_uploader.upload_to_facebook())
                self.assertIsNone(instagram_uploader.upload_to_instagram())
                post.assert_not_called()


if __name__ == "__main__":
    unittest.main()
