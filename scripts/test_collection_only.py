import unittest
from collection_only import validate_collection_only


class CollectionOnlyTests(unittest.TestCase):
    def test_accepts_collection_and_explicit_negatives(self):
        for text in ["Collection only from E2 0RB. Pre-order at least two days ahead.",
                     "We do not offer delivery", "No delivery services are available.",
                     "We don't deliver. Please collect.", "Home delivery is not available."]:
            with self.subTest(text=text):
                validate_collection_only({'body': text})
        validate_collection_only({'faqs': [{'question': 'Do you deliver?',
                                           'answer': 'No, collection only.'}]})

    def test_blocks_claims_in_every_published_text_field(self):
        for field in ['title', 'excerpt', 'body', 'keywords', 'featuredImageAlt', 'current']:
            with self.subTest(field=field):
                with self.assertRaises(ValueError):
                    validate_collection_only({field: 'Fresh food delivered to your door'})
        for value in [{'directAnswer': {'answer': 'We deliver across London'}},
                      {'faqs': [{'answer': 'Request home delivery'}]},
                      {'keywords': ['halal', 'food delivery']}]:
            with self.assertRaises(ValueError):
                validate_collection_only(value)

    def test_negation_does_not_hide_another_claim(self):
        for text in ['No delivery fees: we deliver across London.',
                     'We do not offer delivery, but a courier brings your food.',
                     'Delivery is not available except on weekends.',
                     'We ship meals nationwide', 'Your order arrives at your doorstep']:
            with self.subTest(text=text), self.assertRaises(ValueError):
                validate_collection_only(text)


if __name__ == '__main__':
    unittest.main()
