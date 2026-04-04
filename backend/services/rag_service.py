"""
RAG service — semantic search via Pinecone, keyword fallback if not configured.
"""
from backend.data.rag_content import RAG_CONTENT

KEYWORD_MAP: dict[str, list[str]] = {
    "inspection":   ["inspect", "check", "ppi", "mechanic", "look for"],
    "history":      ["carfax", "autocheck", "history", "report", "vin"],
    "redflags":     ["red flag", "warning", "suspicious", "avoid"],
    "negotiate":    ["negotiat", "offer", "deal", "haggle", "discount"],
    "financing":    ["financ", "loan", "apr", "interest", "payment", "credit"],
    "titles":       ["title", "salvage", "rebuilt", "flood", "lemon"],
    "scams":        ["scam", "fraud", "curbston", "fake", "trick"],
    "testdrive":    ["test drive", "test-drive", "driving"],
    "warranty":     ["warranty", "cpo", "certified", "extended", "coverage"],
    "postpurchase": ["after buy", "registr", "post", "bought"],
    "ev":           ["electric", "ev", "battery", "charging", "hybrid", "tesla"],
    "pricing":        ["kbb", "kelley", "edmunds", "nada", "value", "worth", "pricing"],
    "beginner_guide": ["beginner", "first time", "first-time", "new to", "guide", "framework", "steps", "phase", "walkaround", "paperwork", "130-u", "virtual screening"],
}


def retrieve(query: str) -> tuple[str | None, str | None]:
    """
    Returns (topic_id, content) for the best match.
    Tries Pinecone semantic search first, falls back to keyword matching.
    """
    # Pinecone semantic search
    try:
        from backend.services import pinecone_service
        content = pinecone_service.retrieve(query)
        if content:
            return "semantic", content
    except Exception:
        pass

    # Keyword fallback
    lower = query.lower()
    for topic, keywords in KEYWORD_MAP.items():
        if any(kw in lower for kw in keywords):
            return topic, RAG_CONTENT[topic]

    return None, None


def get_all_content() -> str:
    """Return all RAG content concatenated, for use as system context."""
    return "\n\n".join(
        f"## {topic.upper()}\n{content}"
        for topic, content in RAG_CONTENT.items()
    )
