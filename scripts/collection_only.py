"""Conservative publishing guard; uncertain fulfilment wording needs review."""
import re

FULFILMENT = re.compile(r"\b(?:deliver\w*|shipping|ships?|shipped|courier\w*|doorstep)\b", re.I)
# Remove only explicit negative phrases, never an entire sentence containing one.
NEGATIVE = re.compile(
    r"\b(?:(?:we|bonna'?s)\s+(?:do not|does not|don't|doesn't|never)\s+"
    r"(?:offer\s+|provide\s+)?(?:home\s+)?(?:delivery|shipping|courier services|deliver)"
    r"|no\s+(?:home\s+)?(?:delivery|shipping|courier services)(?:\s+services)?"
    r"|(?:home\s+)?(?:delivery|shipping|courier services)(?:\s+services)?\s+"
    r"(?:is|are)\s+(?:not available|unavailable|not offered|not provided))\b", re.I)
DELIVERY_QUESTION = re.compile(r"(?:do you deliver|does bonna'?s deliver|do you offer (?:home )?delivery)\?", re.I)


def validate_collection_only(value, path="content"):
    """Reject suspect text anywhere in a document without calling external services.

    Explicit delivery questions are allowed only in question fields. This lexical
    guard deliberately errs toward review and cannot prove semantic accuracy.
    """
    if isinstance(value, dict):
        for key, child in value.items():
            # URLs/IDs are identifiers, not business promises; old filenames can
            # contain delivery wording even when the actual copy is accurate.
            if key not in {"_id", "_key", "_type", "featuredImageUrl", "url"}:
                validate_collection_only(child, f"{path}.{key}")
    elif isinstance(value, list):
        for index, child in enumerate(value):
            validate_collection_only(child, f"{path}[{index}]")
    elif isinstance(value, str):
        text = value.replace("’", "'")
        if path.endswith('.question') and DELIVERY_QUESTION.fullmatch(text.strip()):
            return
        conditional = re.search(r'\b(?:except|unless|only on|available on)\b', text, re.I)
        if FULFILMENT.search(NEGATIVE.sub('', text)) or (FULFILMENT.search(text) and conditional):
            raise ValueError(f"Possible delivery/shipping claim in {path}; collection only")
