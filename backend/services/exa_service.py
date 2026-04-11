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
    zip_code      = (preferences.get("zip_code") or "").strip()
    # radius_miles is noted but mock data lacks lat/lng for true geo-distance;
    # we approximate by matching the first 3 zip digits (same metro area).
    zip_prefix    = zip_code[:3] if len(zip_code) == 5 else ""

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
        # Location: approximate match on first 3 zip digits when zip is provided
        if zip_prefix and d.get("zip", "")[:3] != zip_prefix:
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

    from concurrent.futures import TimeoutError as FuturesTimeoutError

    with ThreadPoolExecutor(max_workers=len(DOMAINS)) as pool:
        futures = {pool.submit(_search_domain, d): d for d in DOMAINS}
        try:
            for future in as_completed(futures, timeout=25):
                try:
                    domain_results = future.result()
                except Exception:
                    domain_results = []
                if domain_results:
                    sites_with_results += 1
                all_results.extend(domain_results)
        except FuturesTimeoutError:
            # Collect whatever completed before the timeout instead of failing
            logger.warning("Exa timed out after 25s — using %d results collected so far", len(all_results))
            for f in futures:
                if f.done() and not f.exception():
                    try:
                        r = f.result()
                        if r:
                            all_results.extend(r)
                            sites_with_results += 1
                    except Exception:
                        pass

    logger.info("Exa returned %d total results from %d/%d sites", len(all_results), sites_with_results, len(DOMAINS))

    if not all_results:
        logger.warning("Exa returned no results — falling back to filtered mock listings")
        from backend.data.mock_listings import MOCK_LISTINGS
        return _filter_mock(MOCK_LISTINGS, preferences), 0

    raw = []
    for r in all_results:
        # highlights may be strings or Highlight objects — extract text safely
        highlights = getattr(r, "highlights", None) or []
        highlight_parts = []
        for h in highlights:
            highlight_parts.append(h if isinstance(h, str) else getattr(h, "text", str(h)))
        highlight_text = " | ".join(highlight_parts)
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
        logger.warning("Claude could not parse Exa results — falling back to filtered mock listings")
        from backend.data.mock_listings import MOCK_LISTINGS
        return _filter_mock(MOCK_LISTINGS, preferences), 0

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


_PARSE_PROMPT = """Extract every individual used car listing from these web pages. Output ONLY a JSON array — no explanation, no markdown.

Each object must have:
{"year":2021,"make":"Toyota","model":"Camry SE","price":22500,"mileage":34000,"fuel":"Gasoline","body":"Sedan","transmission":"Automatic","drivetrain":"FWD","color":"White","dealer":"AutoNation","dealer_type":"dealer","url":"https://...","source":"CarGurus"}

Rules:
- Include every car that has at least year + make + price
- Defaults: fuel="Gasoline", transmission="Automatic", drivetrain="FWD", color="Unknown", dealer_type="dealer", mileage=0
- price must be a positive integer (skip if missing)
- Return ONLY the JSON array, starting with [ and ending with ]

Pages:
"""


def _parse_batch(client, raw_batch: list[dict], id_offset: int) -> list[dict]:
    prompt = _PARSE_PROMPT + json.dumps(raw_batch, indent=2)
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=8192,
        messages=[{"role": "user", "content": prompt}],
    )

    text = (response.content[0].text if response.content else "[]").strip()

    # Strip markdown code fences
    if "```" in text:
        parts = text.split("```")
        for part in parts:
            part = part.strip()
            if part.startswith("json"):
                part = part[4:].strip()
            if part.startswith("["):
                text = part
                break

    # Extract JSON array even if there's surrounding text
    start = text.find("[")
    end = text.rfind("]")
    if start == -1 or end == -1:
        logger.warning("_parse_batch: no JSON array found in Claude response: %r", text[:200])
        return []
    text = text[start:end + 1]

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError as e:
        logger.warning("_parse_batch: JSON decode error: %s — snippet: %r", e, text[:200])
        return []

    result = []
    for i, l in enumerate(parsed):
        if not isinstance(l, dict):
            continue
        try:
            price = int(l.get("price") or 0)
            if price <= 0:
                continue
            year = int(l.get("year") or 2020)
            mileage = int(l.get("mileage") or 0)
            body = l.get("body") or "Sedan"
            make = str(l.get("make") or "Unknown")
            model = str(l.get("model") or "Unknown")
            source = l.get("source") or "Web"
            raw_url = l.get("url") or ""
            url = _listing_url(raw_url, source, make, model, year)
            result.append({
                "id": id_offset + i + 1,
                "year": year,
                "make": make,
                "model": model,
                "price": price,
                "mileage": mileage,
                "fuel": l.get("fuel") or "Gasoline",
                "body": body,
                "transmission": l.get("transmission") or "Automatic",
                "drivetrain": l.get("drivetrain") or "FWD",
                "color": l.get("color") or "Unknown",
                "source": source,
                "url": url,
                "dealer": l.get("dealer") or "Dealer",
                "dealer_type": l.get("dealer_type") or "dealer",
                "score": _score(year, mileage),
                "img": _emoji(body),
                "zip": "",
            })
        except (ValueError, TypeError):
            continue
    return result


def _parse_with_claude(raw: list[dict]) -> list[dict]:
    import anthropic as ant

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return []

    client = ant.Anthropic(api_key=api_key)

    # Process in batches of 5 pages — prevents token overflow and partial truncation
    BATCH_SIZE = 5
    all_listings: list[dict] = []
    for i in range(0, len(raw), BATCH_SIZE):
        batch = raw[i:i + BATCH_SIZE]
        try:
            listings = _parse_batch(client, batch, id_offset=len(all_listings))
            all_listings.extend(listings)
            logger.info("_parse_with_claude: batch %d-%d → %d listings", i, i + len(batch), len(listings))
        except Exception as e:
            logger.warning("_parse_with_claude: batch %d failed: %s", i, e)

    return all_listings


def _listing_url(raw_url: str, source: str, make: str, model: str, year: int) -> str:
    """
    Return a reliable URL for this listing.
    Individual listing pages expire when cars sell; category/search pages stay valid.
    We check if the raw URL looks like a real individual listing — if not, we build
    a platform search URL so the user always lands on a relevant, working page.
    """
    import re
    # Patterns that indicate a real individual listing page (contains a unique ID)
    individual_patterns = [
        r"/vehicledetail/",          # cars.com
        r"/car-details/[a-z0-9]+",   # carmax
        r"/vehicle/[a-z0-9-]+-\d+",  # carvana
        r"listing[_-]?id=\d+",       # cargurus param
        r"/cars-for-sale/.*-\d{6,}", # autotrader listing ID in slug
        r"/inventorydetails/",        # various dealers
        r"/vin/[A-Z0-9]{17}",        # VIN-based
    ]
    for pattern in individual_patterns:
        if re.search(pattern, raw_url, re.IGNORECASE):
            return raw_url  # looks like a real individual listing

    # Build a targeted search URL on the platform instead
    m = make.lower().replace(" ", "-").replace("/", "-")
    mo = model.lower().split()[0].replace(" ", "-").replace("/", "-")  # first word of model

    search_urls = {
        "Cars.com":    f"https://www.cars.com/shopping/{m}-{mo}/?year_min={year}&year_max={year}",
        "Autotrader":  f"https://www.autotrader.com/cars-for-sale/used-cars/{m}/{mo}/?startYear={year}&endYear={year}",
        "CarGurus":    f"https://www.cargurus.com/Cars/new/nl_{make.replace(' ', '_')}_{model.split()[0].replace(' ', '_')}",
        "CarMax":      f"https://www.carmax.com/cars/{m}/{mo}",
        "Carvana":     f"https://www.carvana.com/cars/{m}?year-min={year}&year-max={year}",
        "TrueCar":     f"https://www.truecar.com/used-cars-for-sale/listings/{m}/{mo}/?year[]={year}",
        "Edmunds":     f"https://www.edmunds.com/{m}/{mo}/{year}/vin/",
        "Vroom":       f"https://www.vroom.com/cars?year_min={year}&year_max={year}&make={make}",
        "Craigslist":  f"https://www.craigslist.org/search/cto?query={make}+{model}&min_auto_year={year}&max_auto_year={year}",
    }
    fallback = search_urls.get(source)
    return fallback if fallback else raw_url


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
