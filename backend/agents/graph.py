"""
LangGraph state machine for the CarAssist multi-agent pipeline.

Flow:
  START -> router -> (search | rag | analysis | synthesizer) -> synthesizer -> END

The router inspects intent and dispatches to the right specialised node.
After each specialised node the pipeline always converges at the synthesizer
which produces the final user-facing response.
"""
from langgraph.graph import StateGraph, END, START

from backend.agents.state import CarAssistState
from backend.agents.nodes import (
    router_node,
    search_node,
    rag_node,
    analysis_node,
    synthesis_node,
)


def route_after_router(state: CarAssistState) -> str:
    """Conditional edge: choose the next node based on classified intent."""
    intent = state.get("intent", "general")
    if intent == "search":
        return "search"
    elif intent == "rag":
        return "rag"
    elif intent == "analysis":
        return "analysis"
    elif intent == "recommend":
        return "search"   # search first, then let synthesizer craft recommendation
    else:
        return "synthesizer"


def build_graph():
    builder = StateGraph(CarAssistState)

    # Register nodes
    builder.add_node("router", router_node)
    builder.add_node("search", search_node)
    builder.add_node("rag", rag_node)
    builder.add_node("analysis", analysis_node)
    builder.add_node("synthesizer", synthesis_node)

    # Entry point
    builder.add_edge(START, "router")

    # Conditional dispatch from router
    builder.add_conditional_edges(
        "router",
        route_after_router,
        {
            "search": "search",
            "rag": "rag",
            "analysis": "analysis",
            "synthesizer": "synthesizer",
        },
    )

    # All specialised nodes feed into the synthesizer
    builder.add_edge("search", "synthesizer")
    builder.add_edge("rag", "synthesizer")
    builder.add_edge("analysis", "synthesizer")

    # Synthesizer is terminal
    builder.add_edge("synthesizer", END)

    return builder.compile()


# Module-level singleton — imported by the chat router
carassist_graph = build_graph()
