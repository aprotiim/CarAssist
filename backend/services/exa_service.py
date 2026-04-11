"""
Exa search service — fetches real car listings from the web.
Falls back to mock listings if EXA_API_KEY is not set or search fails.
"""
import os
import json
import logging

logger = logging.getLogger(__name__)


def _filter_mock(listings, preferences: dict) -> list[dict]:
    """Filter mock listings by user preferences. Empty list = no filter applied for that field."""
    budget_min    = preferences.get("budget_min") or 0
    budget_max    = preferences.get("budget_max") or 10_000_000
    year_min      = preferences.get("year_min") or 0
    year_max      = preferences.get("year_max") or 9999
    max_mileage   = preferences.get("max_mileage") or 10_000_000
    brands        = [b.lower() for b in (preferences.get("brands") or [])]
    body_types    = [b.lower() for b in (preferences.get("body_types") or [])]
    fuel_types    = [f.lower() for f in (preferences.get("fuel_types") or [])]
    transmissions = [t.lower() for t in (preferences.get("transmissions") or [])]
    drivetrains   = [d.lower() for d in (preferences.get("drivetrains") or [])]

    results = []
    for l in listings:
        d = l.model_dump() if hasattr(l, "model_dump") else l
        if not (budget_min <= d["price"] <= budget_max):
            continue
        if not (year_min <= d["year"] <= year_max):
            continue
        if d["mileage"] > max_mileage:
            continue
        if brands and d["make"].lower() not in brands:
            continue
        if body_types and d["body"].lower() not in body_types:
            continue
        if fuel_types and d["fuel"].lower() not in fuel_types:
            continue
        if transmissions and d["transmission"].lower() not in transmissions:
            continue
        if drivetrains and d["drivetrain"].lower() not in drivetrains:
            continue
        results.append(d)
    return results


def _get_exa():
    from exa_py import Exa
    api_key = os.getenv("EXA_API_KEY")
    if not api_key:
        raise RuntimeError("EXA_API_KEY not set")
    return Exa(api_key=api_key)


async def search_listings(preferences: dict) -> tuple[list[dict], int]:
    """Search for real car listings. Returns (listings, sites_searched).
    Falls back to mock data immediately if EXA_API_KEY is not set, or on any failure."""
    import asyncio

    # Fast path: skip all network calls if EXA_API_KEY is not configured
    if not os.getenv("EXA_API_KEY"):
        logger.info("EXA_API_KEY not set — filtering mock listings by preferences")
        from backend.data.mock_listings import MOCK_LISTINGS
        return _filter_mock(MOCK_LISTINGS, preferences), 0

    try:
        return await asyncio.get_event_loop().run_in_executor(None, lambda: _exa_search(preferences))
    except Exception as exc:
        logger.error("Exa search failed: %s: %s", type(exc).__name__, exc, exc_info=True)
        from backend.data.mock_listings import MOCK_LISTINGS
        return _filter_mock(MOCK_LISTINGS, preferences), 0


DOMAINS = [
    "cars.com",
    "autotrader.com",
    "cargurus.com",
    "carmax.com",
    "carvana.com",
    "truecar.com",
    "edmunds.com",
    "vroom.com",
    "craigslist.org",
]


def _exa_search(preferences: dict) -> tuple[list[dict], int]:
    from concurrent.futures import ThreadPoolExecutor, as_completed

    exa = _get_exa()
    query = _build_query(preferences)
    logger.info("Exa query: %s", query)

    # Search each domain in parallel — 2 results per domain = up to 18 total
    all_results = []
    sites_with_results = 0

    def _search_domain(domain: str):
        try:
            res = exa.search_and_contents(
                query,
                num_results=3,
                include_domains=[domain],
                text={"max_characters": 3000},
                highlights={"num_sentences": 8, "highlights_per_url": 3},
            )
            return res.results or []
        except Exception as e:
            logger.warning("Exa failed for %s: %s", domain, e)
            return []

    with ThreadPoolExecutor(max_workers=len(DOMAINS)) as pool:
        futures = {pool.submit(_search_domain, d): d for d in DOMAINS}
        for future in as_completed(futures, timeout=10):
            try:
                domain_results = future.result()
            except Exception:
                domain_results = []
            if domain_results:
                sites_with_results += 1
            all_results.extend(domain_results)

    logger.info("Exa returned %d total results from %d/%d sites", len(all_results), sites_with_results, len(DOMAINS))

    if not all_results:
        from backend.data.mock_listings import MOCK_LISTINGS
        return [l.model_dump() for l in MOCK_LISTINGS], 0

    raw = []
    for r in all_results:
        highlights = getattr(r, "highlights", None) or []
        highlight_text = " | ".join(highlights) if highlights else ""
        text = (r.text or "")[:2000]
        combined = f"{highlight_text}\n\n{text}".strip() if highlight_text else text
        raw.append({
            "url": r.url,
            "title": r.title or "",
            "content": combined[:3000],
            "source": _source_from_url(r.url),
        })

    listings = _parse_with_claude(raw)

    if not listings:
        from backend.data.mock_listings import MOCK_LISTINGS
        return [l.model_dump() for l in MOCK_LISTINGS], 0

    return listings, sites_with_results


def _build_query(prefs: dict) -> str:
    parts = []
    brands = prefs.get("brands") or []
    body_types = prefs.get("body_types") or []
    fuel_types = prefs.get("fuel_types") or []
    budget_max = prefs.get("budget_max")
    year_min = prefs.get("year_min")
    year_max = prefs.get("year_max")
    max_mileage = prefs.get("max_mileage")
    zip_code = prefs.get("zip_code") or prefs.get("zip") or ""
    radius = prefs.get("radius_miles") or prefs.get("radius") or 50

    if brands:
        parts.append(" or ".join(brands))
    if body_types:
        parts.append(" ".join(body_types))
    if fuel_types and set(fuel_types) != {"Gasoline"}:
        parts.append(" ".join(fuel_types))
    if year_min and year_max and year_min != year_max:
        parts.append(f"{year_min} to {year_max}")
    elif year_min:
        parts.append(str(year_min))
    if budget_max:
        parts.append(f"under ${budget_max:,}")
    if max_mileage and max_mileage < 150000:
        parts.append(f"under {max_mileage:,} miles")
    if zip_code:
        parts.append(f"near {zip_code} within {radius} miles")

    base = " ".join(parts) if parts else "reliable affordable"
    return f"{base} used car for sale"


def _parse_with_claude(raw: list[dict]) -> list[dict]:
    import anthropic as ant

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return []

    client = ant.Anthropic(api_key=api_key)

    prompt = f"""You are parsing used car listing data from web pages. Extract every individual car listing you can find.

Pages may be individual listing pages OR search results pages containing multiple cars. Extract ALL cars you find with enough info.

For each car listing found, output a JSON object with:
- year (int, e.g. 2021)
- make (string, e.g. "Toyota")
- model (string, e.g. "Camry SE")
- price (int, USD, no commas — e.g. 22500)
- mileage (int, miles, no commas — e.g. 45000; use 0 if not found)
- fuel ("Gasoline", "Diesel", "Hybrid", "Plug-in Hybrid", or "Electric")
- body ("Sedan", "SUV", "Hatchback", "Truck", "Coupe", "Convertible", "Minivan", or "Wagon")
- transmission ("Automatic", "Manual", or "CVT")
- drivetrain ("FWD", "RWD", "AWD", or "4WD")
- color (string, or "Unknown")
- dealer (string, seller/site name)
- dealer_type ("dealer" or "private")
- url (copy from input url field)
- source (copy from input source field)

Rules:
- Extract every car that has at least a year, make, and price
- Default unknown fields: fuel="Gasoline", transmission="Automatic", drivetrain="FWD", color="Unknown", dealer_type="dealer"
- price must be a positive integer — skip only if price is completely absent
- mileage=0 is OK if not mentioned
- Return ONLY a valid JSON array with no explanation

Pages to parse:
{json.dumps(raw, indent=2)}"""

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    text = (response.content[0].text if response.content else "[]").strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        return []

    result = []
    for i, l in enumerate(parsed):
        if not isinstance(l, dict):
            continue
        try:
            price = int(l.get("price") or 0)
            mileage = int(l.get("mileage") or 0)
            if price <= 0:
                continue
            year = int(l.get("year") or 2020)
            body = l.get("body") or "Sedan"
            result.append({
                "id": i + 1,
                "year": year,
                "make": str(l.get("make") or "Unknown"),
                "model": str(l.get("model") or "Unknown"),
                "price": price,
                "mileage": mileage,
                "fuel": l.get("fuel") or "Gasoline",
                "body": body,
                "transmission": l.get("transmission") or "Automatic",
                "drivetrain": l.get("drivetrain") or "FWD",
                "color": l.get("color") or "Unknown",
                "source": l.get("source") or "Web",
                "url": l.get("url") or "",
                "dealer": l.get("dealer") or "Dealer",
                "dealer_type": l.get("dealer_type") or "dealer",
                "score": _score(year, mileage),
                "img": _emoji(body),
                "zip": "",
            })
        except (ValueError, TypeError):
            continue

    return result


def _score(year: int, mileage: int) -> int:
    score = 75
    if mileage < 30000:
        score += 12
    elif mileage < 60000:
        score += 6
    elif mileage > 100000:
        score -= 8
    if year >= 2022:
        score += 10
    elif year >= 2020:
        score += 5
    elif year < 2018:
        score -= 5
    return max(40, min(99, score))


def _emoji(body: str) -> str:
    return {"Truck": "🛻", "SUV": "🚙", "Minivan": "🚐", "Van": "🚐"}.get(body, "🚗")


def _source_from_url(url: str) -> str:
    for name, domain in [
        ("Autotrader", "autotrader"),
        ("Cars.com", "cars.com"),
        ("CarGurus", "cargurus"),
        ("CarMax", "carmax"),
        ("Carvana", "carvana"),
        ("TrueCar", "truecar"),
        ("Edmunds", "edmunds"),
        ("Vroom", "vroom"),
        ("Facebook Marketplace", "facebook"),
        ("Craigslist", "craigslist"),
    ]:
        if domain in url:
            return name
    return "Web"
