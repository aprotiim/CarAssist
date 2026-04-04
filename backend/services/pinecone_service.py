"""
Pinecone vector RAG service.
Uses Pinecone's inference API (multilingual-e5-large) for embeddings.
Falls back gracefully if PINECONE_API_KEY is not set.
"""
import os
import logging

logger = logging.getLogger(__name__)

_pc = None
_index = None
_seeded = False


def _get_client():
    global _pc
    if _pc is None:
        from pinecone import Pinecone
        api_key = os.getenv("PINECONE_API_KEY")
        if not api_key:
            raise RuntimeError("PINECONE_API_KEY not set")
        _pc = Pinecone(api_key=api_key)
    return _pc


def _get_index():
    global _index
    if _index is not None:
        return _index

    pc = _get_client()
    index_name = os.getenv("PINECONE_INDEX_NAME", "carassist-rag")
    existing = [i.name for i in pc.list_indexes()]

    if index_name not in existing:
        from pinecone import ServerlessSpec
        pc.create_index(
            name=index_name,
            dimension=1024,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
        import time
        time.sleep(2)  # wait for index to be ready
        logger.info("Created Pinecone index: %s", index_name)

    _index = pc.Index(index_name)
    return _index


def _embed(texts: list[str], input_type: str = "passage") -> list[list[float]]:
    pc = _get_client()
    result = pc.inference.embed(
        model="multilingual-e5-large",
        inputs=texts,
        parameters={"input_type": input_type, "truncate": "END"},
    )
    return [e.values for e in result]


def seed():
    """
    Upsert all RAG_CONTENT topics into Pinecone.
    Safe to call multiple times — skips if already populated.
    """
    global _seeded
    if _seeded:
        return

    from backend.data.rag_content import RAG_CONTENT
    index = _get_index()

    stats = index.describe_index_stats()
    if stats.total_vector_count >= len(RAG_CONTENT):
        _seeded = True
        logger.info("Pinecone already seeded (%d vectors)", stats.total_vector_count)
        return

    # Delete existing vectors to re-seed with updated content
    index.delete(delete_all=True)

    ids = list(RAG_CONTENT.keys())
    texts = list(RAG_CONTENT.values())
    embeddings = _embed(texts, input_type="passage")

    vectors = [
        {
            "id": topic_id,
            "values": emb,
            "metadata": {"topic": topic_id, "content": text},
        }
        for topic_id, text, emb in zip(ids, texts, embeddings)
    ]
    index.upsert(vectors=vectors)
    _seeded = True
    logger.info("Pinecone seeded with %d RAG topics", len(vectors))


def retrieve(query: str, top_k: int = 2) -> str:
    """
    Semantic search over RAG topics.
    Returns concatenated content of top matches (score > 0.3).
    """
    index = _get_index()
    seed()

    query_emb = _embed([query], input_type="query")[0]
    results = index.query(vector=query_emb, top_k=top_k, include_metadata=True)

    contents = [
        m.metadata["content"]
        for m in results.matches
        if m.metadata and m.score > 0.3
    ]
    return "\n\n---\n\n".join(contents)
