"""
LangGraph node functions for the CarAssist multi-agent pipeline.

Nodes:
  router_node     — classifies intent and extracts structured search preferences
  search_node     — filters MOCK_LISTINGS based on preferences
  rag_node        — retrieves relevant knowledge from RAG_CONTENT
  analysis_node   — deep-dives a single listing with Claude
  synthesis_node  — produces the final user-facing response
"""
import os
import json
import anthropic
from langchain_core.messages import AIMessage, HumanMessage

from backend.agents.state import CarAssistState


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_client() -> anthropic.Anthropic:
    """Create a fresh Anthropic client each call to avoid state issues."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY environment variable not set")
    return anthropic.Anthropic(api_key=api_key)


def _last_user_message(state: CarAssistState) -> str:
    """Return the content of the most recent HumanMessage."""
    for msg in reversed(state["messages"]):
        if isinstance(msg, HumanMessage):
            return msg.content
    return ""


def _format_listing(listing: dict) -> str:
    return (
        f"ID {listing['id']}: {listing['year']} {listing['make']} {listing['model']}\n"
        f"  Price: ${listing['price']:,}  |  Mileage: {listing['mileage']:,} mi  |  Score: {listing['score']}/100\n"
        f"  Fuel: {listing['fuel']}  |  Body: {listing['body']}  |  Drivetrain: {listing['drivetrain']}\n"
        f"  Transmission: {listing['transmission']}  |  Color: {listing['color']}\n"
        f"  Seller: {listing['dealer']} ({listing['dealer_type']})  |  Source: {listing['source']}"
    )


# ---------------------------------------------------------------------------
# 1. Router node
# ---------------------------------------------------------------------------

async def router_node(state: CarAssistState) -> dict:
    """Classify the user's intent and extract search preferences."""
    user_message = _last_user_message(state)

    router_system = """Classify the user's message and extract structured data. Respond ONLY with valid JSON:
{
  "intent": "search" | "rag" | "analysis" | "recommend" | "general",
  "listing_id": null or integer,
  "search_preferences": {
    "budget_min": int or null,
    "budget_max": int or null,
    "body_types": [],
    "fuel_types": [],
    "brands": [],
    "year_min": int or null,
    "year_max": int or null,
    "max_mileage": int or null
  }
}

Intent rules:
- "search": user wants to find cars (mentions budget, type, brand, mileage, year)
- "rag": user has a question about buying process, inspections, financing, scams, titles, negotiation, warranty
- "analysis": user asks about a specific listing or car (may include listing_id)
- "recommend": user wants a recommendation or comparison
- "general": anything else"""

    try:
        client = _get_client()
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=512,
            system=router_system,
            messages=[{"role": "user", "content": user_message}],
        )
        raw = response.content[0].text if response.content else "{}"

        # Strip markdown code fences if present
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        parsed = json.loads(raw)
        intent = parsed.get("intent", "general")
        listing_id = parsed.get("listing_id")
        search_preferences = parsed.get("search_preferences", {})

        # Normalise listing_id
        if isinstance(listing_id, (int, float)) and listing_id:
            listing_id = int(listing_id)
        else:
            listing_id = None

        return {
            "intent": intent,
            "listing_id": listing_id,
            "search_preferences": search_preferences,
        }

    except Exception as exc:
        return {
            "intent": "general",
            "listing_id": None,
            "search_preferences": {},
            "error": f"Router error: {exc}",
        }


# ---------------------------------------------------------------------------
# 2. Search node
# ---------------------------------------------------------------------------

async def search_node(state: CarAssistState) -> dict:
    """Fetch real car listings via Exa web search."""
    try:
        from backend.services import exa_service
        prefs = state.get("search_preferences") or {}
        listings = await exa_service.search_listings(prefs)
        listings.sort(key=lambda l: l.get("score", 0), reverse=True)
        return {"listings": listings[:5]}
    except Exception as exc:
        return {"listings": [], "error": f"Search error: {exc}"}


# ---------------------------------------------------------------------------
# 3. RAG node
# ---------------------------------------------------------------------------

async def rag_node(state: CarAssistState) -> dict:
    """Retrieve relevant knowledge via Pinecone semantic search, keyword fallback."""
    try:
        from backend.services import rag_service
        user_message = _last_user_message(state)
        _, content = rag_service.retrieve(user_message)

        if content:
            return {"rag_context": content}

        # Last-resort fallback: top-3 topics by keyword frequency
        from backend.data.rag_content import RAG_CONTENT
        lower = user_message.lower()
        scored = sorted(
            RAG_CONTENT.items(),
            key=lambda kv: sum(1 for w in lower.split() if w in kv[1].lower()),
            reverse=True,
        )
        combined = "\n\n---\n\n".join(c for _, c in scored[:3])
        return {"rag_context": combined}

    except Exception as exc:
        return {"rag_context": "", "error": f"RAG error: {exc}"}


# ---------------------------------------------------------------------------
# 4. Analysis node
# ---------------------------------------------------------------------------

async def analysis_node(state: CarAssistState) -> dict:
    """Perform deep analysis of a single listing using Claude."""
    try:
        from backend.data.mock_listings import MOCK_LISTINGS

        # Determine which listing to analyse
        listing_id = state.get("listing_id")
        listings = state.get("listings") or []

        listing_dict = None
        if listing_id:
            listing_dict = next(
                (l.model_dump() for l in MOCK_LISTINGS if l.id == listing_id), None
            )

        if not listing_dict and listings:
            listing_dict = listings[0]

        if not listing_dict:
            # Default to listing id=1
            default = next((l for l in MOCK_LISTINGS if l.id == 1), MOCK_LISTINGS[0])
            listing_dict = default.model_dump()

        listing_text = (
            f"{listing_dict['year']} {listing_dict['make']} {listing_dict['model']}\n"
            f"Price: ${listing_dict['price']:,}\n"
            f"Mileage: {listing_dict['mileage']:,} miles\n"
            f"Fuel: {listing_dict['fuel']} | Transmission: {listing_dict['transmission']} "
            f"| Drivetrain: {listing_dict['drivetrain']}\n"
            f"Color: {listing_dict['color']} | Seller: {listing_dict['dealer']} "
            f"({listing_dict['dealer_type']})\n"
            f"Source: {listing_dict['source']} | AI Score: {listing_dict['score']}/100"
        )

        analysis_prompt = f"""Analyze this used car listing for a buyer. Be specific and practical.

Listing: {listing_text}

Provide:
1. Deal assessment (is the price fair? reference the score)
2. Top 3 things to verify/check for this specific car
3. One key negotiation angle
4. Overall recommendation (buy / negotiate / skip)"""

        client = _get_client()
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=800,
            messages=[{"role": "user", "content": analysis_prompt}],
        )
        raw_analysis = response.content[0].text if response.content else ""

        # Build structured result
        analysis_result = {
            "summary": f"{listing_dict['year']} {listing_dict['make']} {listing_dict['model']} — Score {listing_dict['score']}/100",
            "pros": [],
            "cons": [],
            "recommendation": "",
            "raw_analysis": raw_analysis,
        }

        # Simple extraction: look for "buy / negotiate / skip" keywords in output
        lower_analysis = raw_analysis.lower()
        if "buy" in lower_analysis and "negotiate" not in lower_analysis:
            analysis_result["recommendation"] = "buy"
        elif "skip" in lower_analysis:
            analysis_result["recommendation"] = "skip"
        else:
            analysis_result["recommendation"] = "negotiate"

        return {"analysis_result": analysis_result}

    except Exception as exc:
        return {
            "analysis_result": {
                "summary": "",
                "pros": [],
                "cons": [],
                "recommendation": "",
                "raw_analysis": "",
            },
            "error": f"Analysis error: {exc}",
        }


# ---------------------------------------------------------------------------
# 5. Synthesis node
# ---------------------------------------------------------------------------

async def synthesis_node(state: CarAssistState) -> dict:
    """Produce the final user-facing response by synthesising all gathered context."""
    synthesis_system = """You are CarAssist, an expert AI assistant for used car buyers in the USA.
Be concise, practical, and direct. Format responses clearly.
When showing car listings, format them as a clean numbered list.
When answering buying questions, be specific and actionable.
Keep responses under 500 words."""

    try:
        # Build context sections
        context_parts: list[str] = []

        listings = state.get("listings") or []
        if listings:
            listing_lines = [f"\n{i+1}. {_format_listing(l)}" for i, l in enumerate(listings)]
            context_parts.append("AVAILABLE LISTINGS:\n" + "\n".join(listing_lines))

        rag_context = state.get("rag_context") or ""
        if rag_context:
            context_parts.append(f"REFERENCE KNOWLEDGE:\n{rag_context}")

        analysis_result = state.get("analysis_result") or {}
        raw_analysis = analysis_result.get("raw_analysis") or ""
        if raw_analysis:
            context_parts.append(f"LISTING ANALYSIS:\n{raw_analysis}")

        error = state.get("error") or ""
        if error:
            context_parts.append(f"NOTE: A partial error occurred: {error}")

        # Build messages for Claude
        claude_messages = []

        # Add conversation history
        for msg in state["messages"]:
            if isinstance(msg, HumanMessage):
                claude_messages.append({"role": "user", "content": msg.content})
            elif isinstance(msg, AIMessage):
                claude_messages.append({"role": "assistant", "content": msg.content})

        # Append context to the last user message
        if context_parts and claude_messages:
            last_msg = claude_messages[-1]
            if last_msg["role"] == "user":
                context_block = "\n\n".join(context_parts)
                claude_messages[-1] = {
                    "role": "user",
                    "content": f"{last_msg['content']}\n\n[Context for your response]\n{context_block}",
                }

        # Ensure we have at least one message
        if not claude_messages:
            claude_messages = [{"role": "user", "content": "Hello, I need help buying a used car."}]

        client = _get_client()
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=synthesis_system,
            messages=claude_messages,
        )
        final_response = response.content[0].text if response.content else "I'm sorry, I couldn't generate a response. Please try again."

        return {
            "final_response": final_response,
            "messages": [AIMessage(content=final_response)],
        }

    except Exception as exc:
        error_msg = (
            "I'm sorry, I encountered an issue generating your response. "
            "Please check your connection and try again."
        )
        return {
            "final_response": error_msg,
            "error": f"Synthesis error: {exc}",
            "messages": [AIMessage(content=error_msg)],
        }
