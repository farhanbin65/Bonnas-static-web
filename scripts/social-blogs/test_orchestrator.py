import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from social_media_orchestrator import orchestrate_blog_post

blog = {
    'title': 'Test Bangladeshi Dish',
    'excerpt': 'A delicious test',
    'featured_image_url': 'https://www.bonnas.co.uk/photos/f1.jpeg',
    'keywords': ['bangladeshi', 'food'],
    'slug': 'test-dish'
}

result = orchestrate_blog_post(blog)
if result:
    with open(result['manifest_path']) as f:
        manifest = json.load(f)
    print("\n📸 Photos in manifest:")
    print(json.dumps(manifest['photos'], indent=2))
else:
    print("❌ Orchestration failed")
