"""
Pinecone vector RAG service.

Knowledge source: s3://{S3_USERS_BUCKET}/rag/car_buying_guide.md
The document is split on "## " section headers — each section becomes one vector.
Falls back gracefully if Pinecone or S3 is not configured.
"""
import os
import re
import logging

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

_pc = None
_index = None
_seeded = False


# ---------------------------------------------------------------------------
# S3 helpers
# ---------------------------------------------------------------------------

def _s3_client():
    return boto3.client(
        "s3",
        region_name=os.getenv("AWS_REGION", "us-east-1"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )


def _load_guide_from_s3() -> str:
    """
    Fetch rag/car_buying_guide.md from S3.
    Falls back to the local copy in backend/data/ if S3 is unavailable.
    """
    bucket = os.getenv("S3_USERS_BUCKET")
    key = "rag/car_buying_guide.md"

    if bucket:
        try:
            resp = _s3_client().get_object(Bucket=bucket, Key=key)
            content = resp["Body"].read().decode("utf-8")
            logger.info("Loaded RAG guide from s3://%s/%s", bucket, key)
            return content
        except ClientError as e:
            logger.warning("Could not load guide from S3 (%s) — falling back to local file", e)

    # Local fallback
    local = os.path.join(os.path.dirname(__file__), "..", "data", "car_buying_guide.md")
    with open(os.path.normpath(local), encoding="utf-8") as f:
        logger.info("Loaded RAG guide from local file")
        return f.read()


def _chunk_guide(text: str) -> list[dict]:
    """
    Split the guide on '## ' section headers.
    Returns a list of {"id": slug, "content": full_section_text} dicts.
    """
    sections = re.split(r"\n(?=## )", text)
    chunks = []
    for section in sections:
        lines = section.strip().splitlines()
        if not lines:
            continue
        header = lines[0].lstrip("#").strip()
        slug = re.sub(r"[^a-z0-9]+", "_", header.lower()).strip("_")[:60]
        chunks.append({"id": slug, "content": section.strip()})
    return chunks


# ---------------------------------------------------------------------------
# Pinecone helpers
# ---------------------------------------------------------------------------

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
    index_name = os.getenv("PINECONE_INDEX_NAME", "cargenuity-rag")
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
        time.sleep(2)
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


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def seed():
    """
    Load the car buying guide from S3 (or local fallback), chunk by section,
    and upsert into Pinecone. Safe to call multiple times.
    """
    global _seeded
    if _seeded:
        return

    chunks = _chunk_guide(_load_guide_from_s3())
    index = _get_index()

    stats = index.describe_index_stats()
    if stats.total_vector_count >= len(chunks):
        _seeded = True
        logger.info("Pinecone already seeded (%d vectors)", stats.total_vector_count)
        return

    index.delete(delete_all=True)

    ids = [c["id"] for c in chunks]
    texts = [c["content"] for c in chunks]
    embeddings = _embed(texts, input_type="passage")

    vectors = [
        {
            "id": chunk_id,
            "values": emb,
            "metadata": {"content": text},
        }
        for chunk_id, text, emb in zip(ids, texts, embeddings)
    ]
    index.upsert(vectors=vectors)
    _seeded = True
    logger.info("Pinecone seeded with %d chunks from car buying guide", len(vectors))


def retrieve(query: str, top_k: int = 3) -> str:
    """
    Semantic search over the car buying guide chunks.
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
