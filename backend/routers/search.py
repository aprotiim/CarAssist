from fastapi import APIRouter, HTTPException
from backend.models.schemas import SearchPreferences, SearchResponse, Listing, ListingAnalysisRequest, ListingAnalysisResponse
from backend.data.mock_listings import MOCK_LISTINGS
from backend.services import claude_service

router = APIRouter(prefix="/api", tags=["search"])


@router.post("/search", response_model=SearchResponse)
async def search(prefs: SearchPreferences) -> SearchResponse:
    filtered = list(MOCK_LISTINGS)

    if prefs.body_types:
        filtered = [l for l in filtered if l.body in prefs.body_types]
    if prefs.fuel_types:
        filtered = [l for l in filtered if l.fuel in prefs.fuel_types]
    if prefs.brands:
        filtered = [l for l in filtered if l.make in prefs.brands]
    if prefs.transmissions:
        filtered = [l for l in filtered if l.transmission in prefs.transmissions]
    if prefs.drivetrains:
        filtered = [l for l in filtered if l.drivetrain in prefs.drivetrains]

    filtered = [
        l for l in filtered
        if prefs.budget_min <= l.price <= prefs.budget_max
        and l.mileage <= prefs.max_mileage
        and prefs.year_min <= l.year <= prefs.year_max
    ]

    return SearchResponse(listings=filtered, total=len(filtered))


@router.get("/listings/{listing_id}", response_model=Listing)
async def get_listing(listing_id: int) -> Listing:
    listing = next((l for l in MOCK_LISTINGS if l.id == listing_id), None)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


@router.post("/listings/{listing_id}/analyze", response_model=ListingAnalysisResponse)
async def analyze_listing(listing_id: int) -> ListingAnalysisResponse:
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
