"""
Claude API service — wraps Anthropic calls for the chat and analysis endpoints.
"""
import os
import anthropic
from backend.models.schemas import ChatMessage
from backend.data.rag_content import SYSTEM_PROMPT


_client: anthropic.Anthropic | None = None


def get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError("ANTHROPIC_API_KEY environment variable not set")
        _client = anthropic.Anthropic(api_key=api_key)
    return _client


def chat(messages: list[ChatMessage]) -> str:
    """Send a list of messages to Claude and return the reply text."""
    client = get_client()
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{"role": m.role, "content": m.content} for m in messages],
    )
    return response.content[0].text if response.content else ""


def analyze_listing(listing_text: str) -> dict:
    """
    Ask Claude to analyze a single listing and return structured feedback.
    Returns a dict with: summary, pros, cons, recommendation, deal_score.
    """
    client = get_client()
    prompt = f"""Analyze this used car listing and respond in this exact JSON format:
{{
  "summary": "one-sentence summary",
  "pros": ["pro1", "pro2", "pro3"],
  "cons": ["con1", "con2"],
  "recommendation": "short recommendation",
  "deal_score": 85.0
}}

Listing:
{listing_text}

Respond ONLY with the JSON object, no other text."""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}],
    )

    import json
    text = response.content[0].text if response.content else "{}"
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "summary": "Analysis unavailable",
            "pros": [],
            "cons": [],
            "recommendation": "Please try again.",
            "deal_score": 0.0,
        }
