from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


# ── Preferences ──────────────────────────────────────────────────────────────

class SearchPreferences(BaseModel):
    budget_min: int = 5000
    budget_max: int = 50000
    body_types: list[str] = []
    fuel_types: list[str] = []
    max_mileage: int = 150000
    year_min: int = 2010
    year_max: int = 2025
    transmissions: list[str] = []
    drivetrains: list[str] = []
    features: list[str] = []
    brands: list[str] = []
    zip_code: str = ""
    radius_miles: int = 50


# ── Listings ──────────────────────────────────────────────────────────────────

class Listing(BaseModel):
    id: int
    year: int
    make: str
    model: str
    price: int
    mileage: int
    fuel: str
    body: str
    transmission: str
    drivetrain: str
    color: str
    source: str
    dealer: str
    dealer_type: str   # "dealer" | "private"
    score: float
    img: str
    zip: str


class SearchResponse(BaseModel):
    listings: list[Listing]
    total: int


# ── Chat ─────────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str          # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    stream: bool = False


class ChatResponse(BaseModel):
    reply: str
    topic_matched: Optional[str] = None


# ── Analysis ─────────────────────────────────────────────────────────────────

class ListingAnalysisRequest(BaseModel):
    listing_id: int


class ListingAnalysisResponse(BaseModel):
    listing_id: int
    summary: str
    pros: list[str]
    cons: list[str]
    recommendation: str
    deal_score: float
