"""
RAG knowledge base content for the used car buying guide.
Each entry maps a topic ID to its full text content.
"""

RAG_CONTENT: dict[str, str] = {
    "inspection": (
        "**Pre-Purchase Inspection Checklist**\n\n"
        "**Exterior:** Check all body panels for mismatched paint, uneven gaps, or rust. "
        "Look under the car for fluid leaks. Inspect tires for even wear (uneven = alignment issues). "
        "Check all lights, mirrors, and glass for cracks.\n\n"
        "**Interior:** Test every button, switch, and knob. Check AC (both hot and cold). "
        "Look for water stains on headliner (flood damage). Smell for mold or mildew. "
        "Test all power windows, locks, seats.\n\n"
        "**Engine Bay:** Look for corrosion, frayed belts, cracked hoses. "
        "Check oil dipstick — milky = head gasket issue. "
        "Transmission fluid should be pink/red, not brown/burnt smelling.\n\n"
        "**Test Drive:** Listen for unusual noises during acceleration, braking, and turning. "
        "Test brakes — should be smooth, no pulsing. Check steering — should track straight, no pulling.\n\n"
        "**Always get a pre-purchase inspection from an independent mechanic ($100-200). "
        "This is the single best investment you can make.**"
    ),

    "history": (
        "**Reading Vehicle History Reports**\n\n"
        "**Carfax vs AutoCheck:** Get both — they use different data sources and one may catch what the other misses. "
        "Carfax is better for service history; AutoCheck has a scoring system.\n\n"
        "**Key things to look for:**\n"
        "- Number of previous owners (fewer = generally better)\n"
        "- Accident history (minor fender bender vs. structural damage)\n"
        "- Title issues (salvage, flood, lemon buyback)\n"
        "- Service records (regular maintenance = well cared for)\n"
        "- Odometer readings over time (should increase consistently)\n"
        "- Where the car has been registered (salt states = rust risk)\n\n"
        "**Red flags in reports:** Gaps in registration, title changes across many states quickly "
        "(possible title washing), 'last reported odometer' much lower than current."
    ),

    "redflags": (
        "**Red Flags in Used Car Listings**\n\n"
        "**In the listing:** Price way below market (too good to be true), blurry/few photos, "
        "'selling for a friend/relative', pressure to act fast, won't provide VIN, cash only, "
        "won't allow inspection.\n\n"
        "**At the viewing:** Seller meets you away from their home, car is still warm when you arrive "
        "(hiding cold-start issues), fresh undercoating (hiding rust/damage), strong air freshener "
        "(hiding smells), brand new floor mats or seat covers (hiding damage).\n\n"
        "**Mechanical:** Blue or white smoke from exhaust, check engine light on (or dashboard lights "
        "don't illuminate at startup — may be disabled), fluid leaks, rough idle, grinding when braking, "
        "clunking in suspension.\n\n"
        "**Documentation:** No title in hand, mismatched VIN on title vs. dashboard/door jamb, "
        "out-of-state title, liens on the vehicle."
    ),

    "negotiate": (
        "**Negotiation Guide**\n\n"
        "**Before you negotiate:**\n"
        "1. Research fair market value on KBB, Edmunds, NADA\n"
        "2. Check comparable listings in your area\n"
        "3. Get a pre-purchase inspection — issues found = negotiating leverage\n"
        "4. Get pre-approved for financing (your backup if dealer rate is worse)\n\n"
        "**Negotiation tactics:**\n"
        "- Start 10-15% below your target price, not their asking price\n"
        "- Use the 'walk-away' — be genuinely willing to leave\n"
        "- Focus on out-the-door price, not monthly payments\n"
        "- Point to specific comparable listings at lower prices\n"
        "- Use inspection findings: 'The mechanic found X, which will cost $Y to fix'\n"
        "- Be friendly but firm. Silence is powerful — make your offer and wait.\n\n"
        "**At a dealer:** Negotiate the car price FIRST, then trade-in, then financing. "
        "Never bundle them. Always ask for the out-the-door price in writing."
    ),

    "financing": (
        "**Financing Your Used Car**\n\n"
        "**Get pre-approved first:** Visit your bank or credit union BEFORE the dealer. "
        "This gives you a baseline rate and negotiating power.\n\n"
        "**Financing options ranked:**\n"
        "1. Credit Unions — typically lowest rates\n"
        "2. Banks — competitive, especially with existing relationship\n"
        "3. Online lenders (LightStream, Capital One Auto) — convenient\n"
        "4. Dealer financing — sometimes competitive, but watch for markups\n\n"
        "**Key terms:** APR (annual percentage rate — lower is better), "
        "loan term (36-60 months ideal, avoid 72-84), "
        "down payment (20% ideal, minimum 10%).\n\n"
        "**Watch out for:** Dealer marking up the buy rate, extended warranties rolled into the loan, "
        "'yo-yo financing' (dealer calls saying financing fell through — your pre-approval prevents this), "
        "negative equity from a trade-in being rolled in.\n\n"
        "**Rule of thumb:** Your total car expenses (payment + insurance + gas + maintenance) "
        "should be under 15-20% of your monthly take-home pay."
    ),

    "titles": (
        "**Understanding Title Types**\n\n"
        "**Clean Title:** No major issues reported. This is what you want.\n\n"
        "**Salvage Title:** Insurance company declared the car a total loss "
        "(repair cost exceeded ~75% of value). Cannot be legally driven or insured in most states until rebuilt.\n\n"
        "**Rebuilt Title:** Was salvage, has been repaired and passed inspection. "
        "Can be driven and insured but: resale value is 20-40% less, harder to insure, "
        "and quality of repairs is uncertain.\n\n"
        "**Flood Title:** Damaged by water/flooding. AVOID — water damage causes long-term "
        "electrical issues, mold, corrosion that may not appear for months.\n\n"
        "**Lemon Title:** Manufacturer bought it back under lemon law due to recurring defects. "
        "Must be disclosed. Proceed with extreme caution.\n\n"
        "**Title Washing:** Scam where a salvage title is re-registered in a state with lax rules "
        "to get a 'clean' title. Check history reports carefully and look for registrations in multiple states."
    ),

    "scams": (
        "**Common Used Car Scams**\n\n"
        "**Odometer Rollback:** Digital odometers can be tampered with. "
        "Cross-reference mileage with service records, history reports, and tire/brake wear.\n\n"
        "**Curbstoning:** Unlicensed dealers posing as private sellers to avoid regulations "
        "and sell problematic cars. Red flags: multiple listings from same phone number, "
        "seller can't answer detailed questions about the car's history.\n\n"
        "**VIN Cloning:** Stolen car given the VIN of a legitimate vehicle. "
        "Always check VIN on dashboard, door jamb, and title match.\n\n"
        "**Escrow Scams (online):** Seller claims to use eBay/Amazon escrow service. "
        "These are fake. Never wire money or use unfamiliar payment services.\n\n"
        "**Bait and Switch:** Dealer advertises a great deal, but the car is 'just sold' when you arrive "
        "— they push you to a more expensive option.\n\n"
        "**Protect yourself:** Meet in public, bring a friend, get a PPI, run a history report, "
        "never pay in full before seeing the car, use a cashier's check (not cash) for private sales."
    ),

    "testdrive": (
        "**Test Drive Checklist**\n\n"
        "**Before starting:**\n"
        "- Cold start the engine — listen for unusual noises\n"
        "- Check all warning lights illuminate then turn off\n"
        "- Test all electronics: AC, heat, radio, windows, mirrors, locks\n\n"
        "**During the drive (minimum 30 minutes, varied roads):**\n"
        "- Highway: acceleration, merging ability, wind noise, vibrations at speed\n"
        "- City: stop-and-go behavior, low-speed maneuverability\n"
        "- Parking lot: turn the wheel lock-to-lock, listen for power steering noise\n"
        "- Rough road: suspension noise, rattles, clunks\n"
        "- Hill: test the parking brake\n\n"
        "**Braking:** Apply brakes firmly — should be smooth, no pulsing, pulling, or grinding. "
        "Test ABS on a safe, empty surface if possible.\n\n"
        "**Steering:** Car should track straight. No vibration in the steering wheel. Responsive and predictable.\n\n"
        "**Transmission:** Smooth shifts (automatic), easy engagement (manual). "
        "No slipping, hesitation, or hard shifts."
    ),

    "warranty": (
        "**Warranty Options for Used Cars**\n\n"
        "**Certified Pre-Owned (CPO):** Manufacturer-backed warranty on late-model used cars. "
        "Usually includes multi-point inspection and roadside assistance. Best peace of mind, but costs more.\n\n"
        "**Factory Warranty Remaining:** Some newer used cars still have the original factory warranty. "
        "Check by VIN with the manufacturer.\n\n"
        "**Extended Warranties (Vehicle Service Contracts):**\n"
        "- Powertrain only — covers engine, transmission, drivetrain\n"
        "- Bumper-to-bumper — covers most components\n"
        "- Always read exclusions carefully — what's NOT covered matters most\n\n"
        "**Tips:**\n"
        "- Third-party warranties from reputable companies (Endurance, CARCHEX) are often better "
        "value than dealer-offered ones\n"
        "- Negotiate the warranty price — dealers mark these up significantly\n"
        "- You usually don't have to buy it at time of purchase — you can add later\n"
        "- 'As-Is' means NO warranty — you accept all risk\n"
        "- In most states, dealers must honor implied warranty of merchantability even on 'as-is' sales"
    ),

    "postpurchase": (
        "**Post-Purchase Steps**\n\n"
        "**Immediately:**\n"
        "1. Get insurance before driving off the lot (call your insurer or use an app)\n"
        "2. Get the signed title, bill of sale, and any warranty documents\n"
        "3. For private sales: meet at the DMV to transfer title together\n\n"
        "**Within 30 days:**\n"
        "4. Register the vehicle and get plates at your local DMV/tag office\n"
        "5. Pay sales tax (varies by state, typically 4-9% of purchase price)\n"
        "6. Get a state inspection/emissions test if required\n\n"
        "**First week:**\n"
        "7. Change the oil (you don't know when it was last done)\n"
        "8. Replace the cabin and engine air filters\n"
        "9. Check all fluid levels\n"
        "10. Get a full detail — clean it properly, you'll spot issues you missed\n\n"
        "**First month:**\n"
        "11. Address any issues found during PPI\n"
        "12. Establish a maintenance schedule\n"
        "13. Find a trusted local mechanic\n"
        "14. Set up a maintenance fund ($50-100/month)"
    ),

    "ev": (
        "**EV & Hybrid Buying Guide**\n\n"
        "**Battery Health (Most Important):** Request the battery health/degradation report. "
        "Most EVs lose 2-3% capacity per year. Below 80% = significant range loss. "
        "Battery replacement costs $5,000-$15,000+.\n\n"
        "**Range Reality:** EPA-rated range is optimistic. Real-world range is typically 10-20% less. "
        "Cold weather can reduce range by 20-40%. Consider your daily commute and available charging.\n\n"
        "**Charging Setup:** Level 1 (wall outlet) = 3-5 miles/hour — fine for short commutes. "
        "Level 2 (240V home charger) = 20-30 miles/hour — ideal for daily use, install cost $500-2,000. "
        "DC Fast Charging = 80% in 20-45 min — for road trips.\n\n"
        "**Federal Tax Credits:** Used EVs may qualify for up to $4,000 tax credit (income limits apply). "
        "Check IRS.gov for current eligibility.\n\n"
        "**Common EVs to Consider:** Tesla Model 3/Y (best charging network), Chevy Bolt (affordable), "
        "Hyundai Ioniq 5 (great value), Ford Mustang Mach-E.\n\n"
        "**Hybrid Advantage:** If charging access is limited, a hybrid (Toyota RAV4 Hybrid, Honda CR-V Hybrid) "
        "gives great fuel economy without charging dependency."
    ),

    "pricing": (
        "**Understanding Car Pricing**\n\n"
        "**Valuation Sources:**\n"
        "- **KBB (Kelley Blue Book):** Most well-known, tends to run slightly high\n"
        "- **Edmunds:** Often most accurate for actual transaction prices\n"
        "- **NADA Guides:** Used by banks for loan values\n"
        "- **CarGurus Deal Rating:** Compares to local market prices\n\n"
        "**Price ranges you'll see:**\n"
        "- Trade-in value: lowest (what a dealer gives you)\n"
        "- Private party value: middle (selling to another person)\n"
        "- Dealer retail: highest (buying from a dealer)\n\n"
        "**What affects price:**\n"
        "- Mileage (biggest factor after year/make/model)\n"
        "- Condition (excellent, good, fair, rough)\n"
        "- Color (white, black, silver hold value best)\n"
        "- Options and trim level\n"
        "- Location (same car costs different amounts in different markets)\n"
        "- Season (convertibles cost more in spring, 4WD costs more in fall)\n\n"
        "**Pro tip:** Search the exact year/make/model/trim within 200 miles to see what others are asking. "
        "The market price is what matters, not what any guide says."
    ),

    "beginner_guide": (
        "**The Beginner's Guide to Buying a Used Car — A Strategic Framework for First-Time Buyers**\n\n"
        "Buying a used car can feel like a high-stakes gamble, but by following a structured 'Data-First' approach, "
        "you can eliminate 90% of the risk. This guide breaks the process into four manageable phases.\n\n"

        "**Phase 1: The Virtual Screening (Before You Visit)**\n"
        "Don't fall in love with a photo. Use the listing data to verify the car's 'Digital Health' first.\n"
        "- The 17-Digit VIN: This is the car's social security number. If a seller won't give it to you, walk away.\n"
        "- The Title Status: You are looking for a Clean Title. Avoid 'Salvage' or 'Rebuilt' titles — these indicate "
        "the car was once declared a total loss by an insurance company.\n"
        "- The 'Odometer Gap': Check the service records against the current mileage. If a car has 100,000 miles but "
        "the last recorded service was at 40,000, there is a massive gap in its history.\n\n"

        "**Phase 2: The Physical Audit (The 5-Minute Walkaround)**\n"
        "Once you meet the seller, perform these high-leverage checks before even starting the engine.\n"
        "- The 'Fluid Check': Pull the oil dipstick. If the oil is milky or has bubbles, it could mean a blown head gasket.\n"
        "- The Tire Date Code: Look for a 4-digit number on the tire wall (e.g., 1222 = 12th week of 2022). "
        "Tires older than 6 years are unsafe regardless of tread depth.\n"
        "- Body Panel Gaps: Ensure the gaps between the doors, hood, and trunk are even. Uneven gaps are a classic "
        "sign of a hidden accident and frame repair.\n\n"

        "**Phase 3: The Transaction Protocol (The Paperwork)**\n"
        "In Texas (and most other states), the paperwork makes the sale legal. Ensure you have:\n"
        "- The Original Blue Title: Ensure the name on the front matches the seller's ID.\n"
        "- Form 130-U: Application for Title and Registration — both parties must sign.\n"
        "- Bill of Sale: Lists the VIN, purchase price, date, and signatures of both parties.\n\n"

        "**Phase 4: The Walk-Away Checklist**\n"
        "If you encounter any of the following, do not negotiate — simply leave.\n"
        "- The Seller isn't the Owner: If the name on the title doesn't match the person in front of you, "
        "this is 'Title Flipping' — often illegal and highly risky.\n"
        "- The Check Engine Light is On: Even if the seller says 'it's just a sensor,' do not take the risk "
        "without a professional diagnostic.\n"
        "- The VIN Plate is Damaged: If the VIN plate on the dashboard looks tampered with, the car may be stolen.\n\n"

        "**Final Expert Tip — The PPI:**\n"
        "Always invest $150–$200 in a Pre-Purchase Inspection (PPI) at a local mechanic. "
        "This small investment can save you thousands in hidden repairs later."
    ),
}

SYSTEM_PROMPT = """You are CarAssist, an expert AI assistant helping used car buyers in the USA make smart, confident purchasing decisions.

Knowledge base:
{}

Guidelines:
- Be concise, practical, and friendly.
- Use the knowledge base to answer questions accurately.
- Always recommend getting a pre-purchase inspection from an independent mechanic.
- Warn about common scams and red flags when relevant.
- Keep responses under 400 words unless more detail is requested.
- If asked about something outside used car buying, politely redirect.
""".format(
    "\n\n".join(f"## {k.upper()}\n{v}" for k, v in RAG_CONTENT.items())
)
