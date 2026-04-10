"""
Chat router — LangGraph-powered endpoints for the Cargenuity assistant.

Endpoints:
  POST /api/chat          — invoke the full multi-agent graph, return final response
  GET  /api/chat/stream   — SSE streaming endpoint (token-by-token)
"""
import os
import json
import anthropic
from fastapi import APIRouter, HTTPException, Query
from langchain_core.messages import HumanMessage, AIMessage

from backend.models.schemas import ChatRequest, ChatResponse
from backend.agents.graph import cargenuity_graph

router = APIRouter(prefix="/api/chat", tags=["chat"])


# ---------------------------------------------------------------------------
# POST /api/chat  — full graph invocation
# ---------------------------------------------------------------------------

@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    if not req.messages:
        raise HTTPException(status_code=400, detail="messages array cannot be empty")

    # Last user message drives routing
    last_user = next(
        (m for m in reversed(req.messages) if m.role == "user"), None
    )
    if not last_user:
        raise HTTPException(status_code=400, detail="No user message found")

    # Build initial state — last message first so routing focuses on it
    initial_state = {
        "messages": [HumanMessage(content=last_user.content)],
        "intent": "",
        "search_preferences": {},
        "listings": [],
        "rag_context": "",
        "listing_id": None,
        "analysis_result": {},
        "final_response": "",
        "error": None,
    }

    # Prepend conversation history (all messages except the last one)
    history = req.messages[:-1]
    for msg in history:
        if msg.role == "user":
            initial_state["messages"] = [HumanMessage(content=msg.content)] + initial_state["messages"]
        else:
            initial_state["messages"] = [AIMessage(content=msg.content)] + initial_state["messages"]

    try:
        result = await cargenuity_graph.ainvoke(initial_state)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Graph execution error: {exc}")

    final_response = result.get("final_response") or "I'm sorry, I couldn't generate a response."
    intent = result.get("intent") or None

    return ChatResponse(reply=final_response, topic_matched=intent)


# ---------------------------------------------------------------------------
# GET /api/chat/stream  — SSE streaming
# ---------------------------------------------------------------------------

@router.get("/stream")
async def chat_stream(
    q: str = Query(..., description="User question"),
    history: str = Query(None, description="JSON array of {role, content} messages"),
):
    """
    Server-sent events endpoint that streams Claude's reply token by token.
    Runs the graph first to gather context (listings / RAG / analysis),
    then re-streams the synthesis response.
    """
    try:
        from sse_starlette.sse import EventSourceResponse
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="sse_starlette is not installed. Add it to requirements.txt.",
        )

    # Parse optional history
    history_messages: list[dict] = []
    if history:
        try:
            history_messages = json.loads(history)
        except json.JSONDecodeError:
            history_messages = []

    # Build initial state for graph
    initial_state = {
        "messages": [HumanMessage(content=q)],
        "intent": "",
        "search_preferences": {},
        "listings": [],
        "rag_context": "",
        "listing_id": None,
        "analysis_result": {},
        "final_response": "",
        "error": None,
    }

    for msg in history_messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role == "user":
            initial_state["messages"] = [HumanMessage(content=content)] + initial_state["messages"]
        else:
            initial_state["messages"] = [AIMessage(content=content)] + initial_state["messages"]

    async def event_generator():
        try:
            # Run graph (without synthesis) to gather context
            # We'll run a partial graph up to but not including synthesis,
            # then stream synthesis ourselves.
            # For simplicity: run the full graph silently, then re-stream via Anthropic streaming.
            result = await cargenuity_graph.ainvoke(initial_state)

            listings = result.get("listings") or []
            rag_context = result.get("rag_context") or ""
            analysis_result = result.get("analysis_result") or {}

            # Build context block identical to synthesis_node
            context_parts: list[str] = []
            if listings:
                def _fmt(l: dict) -> str:
                    return (
                        f"ID {l['id']}: {l['year']} {l['make']} {l['model']} — "
                        f"${l['price']:,}, {l['mileage']:,} mi, Score {l['score']}/100"
                    )
                listing_lines = [f"{i+1}. {_fmt(l)}" for i, l in enumerate(listings)]
                context_parts.append("AVAILABLE LISTINGS:\n" + "\n".join(listing_lines))

            if rag_context:
                context_parts.append(f"REFERENCE KNOWLEDGE:\n{rag_context}")

            raw_analysis = analysis_result.get("raw_analysis") or ""
            if raw_analysis:
                context_parts.append(f"LISTING ANALYSIS:\n{raw_analysis}")

            user_content = q
            if context_parts:
                context_block = "\n\n".join(context_parts)
                user_content = f"{q}\n\n[Context for your response]\n{context_block}"

            # Build messages list
            stream_messages: list[dict] = []
            for msg in history_messages:
                stream_messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", ""),
                })
            stream_messages.append({"role": "user", "content": user_content})

            system_prompt = (
                "You are Cargenuity, an expert AI assistant for used car buyers in the USA. "
                "Be concise, practical, and direct. Format responses clearly. "
                "When showing car listings, format them as a clean numbered list. "
                "When answering buying questions, be specific and actionable. "
                "Keep responses under 500 words."
            )

            api_key = os.getenv("ANTHROPIC_API_KEY")
            if not api_key:
                yield {"data": json.dumps({"error": "ANTHROPIC_API_KEY not set"})}
                return

            client = anthropic.Anthropic(api_key=api_key)

            with client.messages.stream(
                model="claude-sonnet-4-6",
                max_tokens=1024,
                system=system_prompt,
                messages=stream_messages,
            ) as stream:
                for text_chunk in stream.text_stream:
                    yield {"data": json.dumps({"token": text_chunk})}

            yield {"data": "[DONE]"}

        except Exception as exc:
            yield {"data": json.dumps({"error": str(exc)})}

    from sse_starlette.sse import EventSourceResponse
    return EventSourceResponse(event_generator())
