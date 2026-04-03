from typing import TypedDict, Annotated, Optional
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage


class CarAssistState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    intent: str                  # "search" | "rag" | "analysis" | "recommend" | "general"
    search_preferences: dict     # extracted from user message
    listings: list[dict]         # search results
    rag_context: str             # retrieved knowledge
    listing_id: Optional[int]    # if user is asking about a specific listing
    analysis_result: dict        # from analysis node
    final_response: str          # synthesized response to send to user
    error: Optional[str]
