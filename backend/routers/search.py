import asyncio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.models.schemas import SearchPreferences, Listing, ListingAnalysisRequest, ListingAnalysisResponse
from backend.services import claude_service

router = APIRouter(prefix="/api", tags=["search"])


class SearchResponse(BaseModel):
    listings: list[dict]
    total: int
    sources_searched: int


@router.post("/search", response_model=SearchResponse)
async def search(prefs: SearchPreferences) -> SearchResponse:
    from backend.services import exa_service

    prefs_dict = {
        "brands": prefs.brands,
        "body_types": prefs.body_types,
        "fuel_types": prefs.fuel_types,
        "budget_min": prefs.budget_min,
        "budget_max": prefs.budget_max,
        "year_min": prefs.year_min,
        "year_max": prefs.year_max,
        "max_mileage": prefs.max_mileage,
    }

    listings, sites_searched = await exa_service.search_listings(prefs_dict)

    return SearchResponse(listings=listings, total=len(listings), sources_searched=sites_searched)


@router.get("/listings/{listing_id}", response_model=Listing)
async def get_listing(listing_id: int):
    from backend.data.mock_listings import MOCK_LISTINGS
    listing = next((l for l in MOCK_LISTINGS if l.id == listing_id), None)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


@router.post("/listings/{listing_id}/analyze", response_model=ListingAnalysisResponse)
async def analyze_listing(listing_id: int):
    from backend.data.mock_listings import MOCK_LISTINGS
    listing = next((l for l in MOCK_LISTINGS if l.id == listing_id), None)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing_text = (
        f"{listing.year} {listing.make} {listing.model}\n"
        f"Price: ${listing.price:,}\n"
        f"Mileage: {listing.mileage:,} miles\n"
        f"Fuel: {listing.fuel} | Transmission: {listing.transmission} | Drivetrain: {listing.drivetrain}\n"
        f"Color: {listing.color} | Seller: {listing.dealer} ({listing.dealer_type})\n"
        f"Source: {listing.source} | Current AI score: {listing.score}/100"
    )

    try:
        analysis = claude_service.analyze_listing(listing_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

    return ListingAnalysisResponse(
        listing_id=listing_id,
        summary=analysis.get("summary", ""),
        pros=analysis.get("pros", []),
        cons=analysis.get("cons", []),
        recommendation=analysis.get("recommendation", ""),
        deal_score=float(analysis.get("deal_score", listing.score)),
    )
