import { useState, useEffect, useRef } from "react";

const STEPS = [
  { key: "budget", label: "Budget", icon: "💰" },
  { key: "bodyType", label: "Body Type", icon: "🚗" },
  { key: "fuel", label: "Fuel Type", icon: "⛽" },
  { key: "year", label: "Year Range", icon: "📅" },
  { key: "mileage", label: "Mileage", icon: "🛣️" },
  { key: "transmission", label: "Transmission", icon: "⚙️" },
  { key: "drivetrain", label: "Drivetrain", icon: "🔧" },
  { key: "features", label: "Features", icon: "✨" },
  { key: "brand", label: "Brand", icon: "🏷️" },
  { key: "location", label: "Location", icon: "📍" },
];

const BODY_TYPES = ["Sedan", "SUV", "Hatchback", "Truck", "Coupe", "Convertible", "Minivan", "Wagon"];
const FUEL_TYPES = ["Gasoline", "Diesel", "Hybrid", "Plug-in Hybrid", "Electric"];
const TRANSMISSIONS = ["Automatic", "Manual", "CVT"];
const DRIVETRAINS = ["FWD", "RWD", "AWD", "4WD"];
const FEATURES = [
  "Backup Camera", "Sunroof/Moonroof", "Leather Seats", "Apple CarPlay",
  "Android Auto", "Heated Seats", "Blind Spot Monitor", "Navigation",
  "Remote Start", "Adaptive Cruise", "Lane Assist", "Keyless Entry",
  "Premium Audio", "Third Row Seats", "Tow Package", "Parking Sensors"
];
const BRANDS = [
  "Toyota", "Honda", "Ford", "Chevrolet", "Hyundai", "Kia",
  "Mazda", "Subaru", "Nissan", "BMW", "Mercedes-Benz", "Audi",
  "Volkswagen", "Lexus", "Jeep", "Ram", "Tesla", "Volvo"
];

const RAG_TOPICS = [
  { id: "inspection", title: "Pre-Purchase Inspection", icon: "🔍", desc: "50-point checklist before you buy" },
  { id: "history", title: "Vehicle History Reports", icon: "📋", desc: "How to read Carfax & AutoCheck" },
  { id: "redflags", title: "Red Flags to Watch For", icon: "🚩", desc: "Warning signs in listings & viewings" },
  { id: "negotiate", title: "Negotiation Tactics", icon: "🤝", desc: "Scripts & strategies to get the best price" },
  { id: "financing", title: "Financing 101", icon: "🏦", desc: "Loans, APR, pre-approval tips" },
  { id: "titles", title: "Title Types Explained", icon: "📄", desc: "Clean, salvage, rebuilt, flood, lemon" },
  { id: "scams", title: "Common Scams", icon: "⚠️", desc: "Odometer fraud, curbstoning & more" },
  { id: "testdrive", title: "Test Drive Checklist", icon: "🛞", desc: "What to check during your test drive" },
  { id: "warranty", title: "Warranty Options", icon: "🛡️", desc: "CPO, extended, powertrain coverage" },
  { id: "postpurchase", title: "Post-Purchase Steps", icon: "✅", desc: "Registration, insurance, first service" },
  { id: "ev", title: "EV Buying Guide", icon: "🔋", desc: "Battery health, charging, tax credits" },
  { id: "pricing", title: "Pricing & Valuation", icon: "💲", desc: "How KBB, Edmunds & NADA values work" },
];

const RAG_CONTENT = {
  inspection: `**Pre-Purchase Inspection Checklist**\n\n**Exterior:** Check all body panels for mismatched paint, uneven gaps, or rust. Look under the car for fluid leaks. Inspect tires for even wear (uneven = alignment issues). Check all lights, mirrors, and glass for cracks.\n\n**Interior:** Test every button, switch, and knob. Check AC (both hot and cold). Look for water stains on headliner (flood damage). Smell for mold or mildew. Test all power windows, locks, seats.\n\n**Engine Bay:** Look for corrosion, frayed belts, cracked hoses. Check oil dipstick — milky = head gasket issue. Transmission fluid should be pink/red, not brown/burnt smelling.\n\n**Test Drive:** Listen for unusual noises during acceleration, braking, and turning. Test brakes — should be smooth, no pulsing. Check steering — should track straight, no pulling.\n\n**Always get a pre-purchase inspection from an independent mechanic ($100-200). This is the single best investment you can make.**`,

  history: `**Reading Vehicle History Reports**\n\n**Carfax vs AutoCheck:** Get both — they use different data sources and one may catch what the other misses. Carfax is better for service history; AutoCheck has a scoring system.\n\n**Key things to look for:**\n- Number of previous owners (fewer = generally better)\n- Accident history (minor fender bender vs. structural damage)\n- Title issues (salvage, flood, lemon buyback)\n- Service records (regular maintenance = well cared for)\n- Odometer readings over time (should increase consistently)\n- Where the car has been registered (salt states = rust risk)\n\n**Red flags in reports:** Gaps in registration, title changes across many states quickly (possible title washing), "last reported odometer" much lower than current.`,

  redflags: `**Red Flags in Used Car Listings**\n\n**In the listing:** Price way below market (too good to be true), blurry/few photos, "selling for a friend/relative", pressure to act fast, won't provide VIN, cash only, won't allow inspection.\n\n**At the viewing:** Seller meets you away from their home, car is still warm when you arrive (hiding cold-start issues), fresh undercoating (hiding rust/damage), strong air freshener (hiding smells), brand new floor mats or seat covers (hiding damage).\n\n**Mechanical:** Blue or white smoke from exhaust, check engine light on (or dashboard lights don't illuminate at startup — may be disabled), fluid leaks, rough idle, grinding when braking, clunking in suspension.\n\n**Documentation:** No title in hand, mismatched VIN on title vs. dashboard/door jamb, out-of-state title, liens on the vehicle.`,

  negotiate: `**Negotiation Guide**\n\n**Before you negotiate:**\n1. Research fair market value on KBB, Edmunds, NADA\n2. Check comparable listings in your area\n3. Get a pre-purchase inspection — issues found = negotiating leverage\n4. Get pre-approved for financing (your backup if dealer rate is worse)\n\n**Negotiation tactics:**\n- Start 10-15% below your target price, not their asking price\n- Use the "walk-away" — be genuinely willing to leave\n- Focus on out-the-door price, not monthly payments\n- Point to specific comparable listings at lower prices\n- Use inspection findings: "The mechanic found X, which will cost $Y to fix"\n- Be friendly but firm. Silence is powerful — make your offer and wait.\n\n**At a dealer:** Negotiate the car price FIRST, then trade-in, then financing. Never bundle them. Always ask for the out-the-door price in writing.`,

  financing: `**Financing Your Used Car**\n\n**Get pre-approved first:** Visit your bank or credit union BEFORE the dealer. This gives you a baseline rate and negotiating power.\n\n**Financing options ranked:**\n1. Credit Unions — typically lowest rates\n2. Banks — competitive, especially with existing relationship\n3. Online lenders (LightStream, Capital One Auto) — convenient\n4. Dealer financing — sometimes competitive, but watch for markups\n\n**Key terms:** APR (annual percentage rate — lower is better), loan term (36-60 months ideal, avoid 72-84), down payment (20% ideal, minimum 10%).\n\n**Watch out for:** Dealer marking up the buy rate, extended warranties rolled into the loan, "yo-yo financing" (dealer calls saying financing fell through — your pre-approval prevents this), negative equity from a trade-in being rolled in.\n\n**Rule of thumb:** Your total car expenses (payment + insurance + gas + maintenance) should be under 15-20% of your monthly take-home pay.`,

  titles: `**Understanding Title Types**\n\n**Clean Title:** No major issues reported. This is what you want.\n\n**Salvage Title:** Insurance company declared the car a total loss (repair cost exceeded ~75% of value). Cannot be legally driven or insured in most states until rebuilt.\n\n**Rebuilt Title:** Was salvage, has been repaired and passed inspection. Can be driven and insured but: resale value is 20-40% less, harder to insure, and quality of repairs is uncertain.\n\n**Flood Title:** Damaged by water/flooding. AVOID — water damage causes long-term electrical issues, mold, corrosion that may not appear for months.\n\n**Lemon Title:** Manufacturer bought it back under lemon law due to recurring defects. Must be disclosed. Proceed with extreme caution.\n\n**Title Washing:** Scam where a salvage title is re-registered in a state with lax rules to get a "clean" title. Check history reports carefully and look for registrations in multiple states.`,

  scams: `**Common Used Car Scams**\n\n**Odometer Rollback:** Digital odometers can be tampered with. Cross-reference mileage with service records, history reports, and tire/brake wear.\n\n**Curbstoning:** Unlicensed dealers posing as private sellers to avoid regulations and sell problematic cars. Red flags: multiple listings from same phone number, seller can't answer detailed questions about the car's history.\n\n**VIN Cloning:** Stolen car given the VIN of a legitimate vehicle. Always check VIN on dashboard, door jamb, and title match.\n\n**Escrow Scams (online):** Seller claims to use eBay/Amazon escrow service. These are fake. Never wire money or use unfamiliar payment services.\n\n**Bait and Switch:** Dealer advertises a great deal, but the car is "just sold" when you arrive — they push you to a more expensive option.\n\n**Protect yourself:** Meet in public, bring a friend, get a PPI, run a history report, never pay in full before seeing the car, use a cashier's check (not cash) for private sales.`,

  testdrive: `**Test Drive Checklist**\n\n**Before starting:**\n- Cold start the engine — listen for unusual noises\n- Check all warning lights illuminate then turn off\n- Test all electronics: AC, heat, radio, windows, mirrors, locks\n\n**During the drive (minimum 30 minutes, varied roads):**\n- Highway: acceleration, merging ability, wind noise, vibrations at speed\n- City: stop-and-go behavior, low-speed maneuverability\n- Parking lot: turn the wheel lock-to-lock, listen for power steering noise\n- Rough road: suspension noise, rattles, clunks\n- Hill: test the parking brake\n\n**Braking:** Apply brakes firmly — should be smooth, no pulsing, pulling, or grinding. Test ABS on a safe, empty surface if possible.\n\n**Steering:** Car should track straight. No vibration in the steering wheel. Responsive and predictable.\n\n**Transmission:** Smooth shifts (automatic), easy engagement (manual). No slipping, hesitation, or hard shifts.`,

  warranty: `**Warranty Options for Used Cars**\n\n**Certified Pre-Owned (CPO):** Manufacturer-backed warranty on late-model used cars. Usually includes multi-point inspection and roadside assistance. Best peace of mind, but costs more.\n\n**Factory Warranty Remaining:** Some newer used cars still have the original factory warranty. Check by VIN with the manufacturer.\n\n**Extended Warranties (Vehicle Service Contracts):**\n- Powertrain only — covers engine, transmission, drivetrain\n- Bumper-to-bumper — covers most components\n- Always read exclusions carefully — what's NOT covered matters most\n\n**Tips:**\n- Third-party warranties from reputable companies (Endurance, CARCHEX) are often better value than dealer-offered ones\n- Negotiate the warranty price — dealers mark these up significantly\n- You usually don't have to buy it at time of purchase — you can add later\n- "As-Is" means NO warranty — you accept all risk\n- In most states, dealers must honor implied warranty of merchantability even on "as-is" sales for a short period`,

  postpurchase: `**Post-Purchase Steps**\n\n**Immediately:**\n1. Get insurance before driving off the lot (call your insurer or use an app)\n2. Get the signed title, bill of sale, and any warranty documents\n3. For private sales: meet at the DMV to transfer title together\n\n**Within 30 days:**\n4. Register the vehicle and get plates at your local DMV/tag office\n5. Pay sales tax (varies by state, typically 4-9% of purchase price)\n6. Get a state inspection/emissions test if required\n\n**First week:**\n7. Change the oil (you don't know when it was last done)\n8. Replace the cabin and engine air filters\n9. Check all fluid levels\n10. Get a full detail — clean it properly, you'll spot issues you missed\n\n**First month:**\n11. Address any issues found during PPI\n12. Establish a maintenance schedule\n13. Find a trusted local mechanic\n14. Set up a maintenance fund ($50-100/month)`,

  ev: `**EV & Hybrid Buying Guide**\n\n**Battery Health (Most Important):** Request the battery health/degradation report. Most EVs lose 2-3% capacity per year. Below 80% = significant range loss. Battery replacement costs $5,000-$15,000+.\n\n**Range Reality:** EPA-rated range is optimistic. Real-world range is typically 10-20% less. Cold weather can reduce range by 20-40%. Consider your daily commute and available charging.\n\n**Charging Setup:** Level 1 (wall outlet) = 3-5 miles/hour — fine for short commutes. Level 2 (240V home charger) = 20-30 miles/hour — ideal for daily use, install cost $500-2,000. DC Fast Charging = 80% in 20-45 min — for road trips.\n\n**Federal Tax Credits:** Used EVs may qualify for up to $4,000 tax credit (income limits apply). Check IRS.gov for current eligibility.\n\n**Common EVs to Consider:** Tesla Model 3/Y (best charging network), Chevy Bolt (affordable), Hyundai Ioniq 5 (great value), Ford Mustang Mach-E.\n\n**Hybrid Advantage:** If charging access is limited, a hybrid (Toyota RAV4 Hybrid, Honda CR-V Hybrid) gives great fuel economy without charging dependency.`,

  pricing: `**Understanding Car Pricing**\n\n**Valuation Sources:**\n- **KBB (Kelley Blue Book):** Most well-known, tends to run slightly high\n- **Edmunds:** Often most accurate for actual transaction prices\n- **NADA Guides:** Used by banks for loan values\n- **CarGurus Deal Rating:** Compares to local market prices\n\n**Price ranges you'll see:**\n- Trade-in value: lowest (what a dealer gives you)\n- Private party value: middle (selling to another person)\n- Dealer retail: highest (buying from a dealer)\n\n**What affects price:**\n- Mileage (biggest factor after year/make/model)\n- Condition (excellent, good, fair, rough)\n- Color (white, black, silver hold value best)\n- Options and trim level\n- Location (same car costs different amounts in different markets)\n- Season (convertibles cost more in spring, 4WD costs more in fall)\n\n**Pro tip:** Search the exact year/make/model/trim within 200 miles to see what others are asking. The market price is what matters, not what any guide says.`
};

// Mock listings data
const MOCK_LISTINGS = [
  { id: 1, year: 2021, make: "Toyota", model: "Camry SE", price: 22500, mileage: 34000, fuel: "Gasoline", body: "Sedan", transmission: "Automatic", drivetrain: "FWD", color: "White", source: "CarGurus", dealer: "AutoNation Toyota", dealerType: "dealer", score: 92, img: "🚗", zip: "32601" },
  { id: 2, year: 2020, make: "Honda", model: "CR-V EX", price: 25800, mileage: 41000, fuel: "Gasoline", body: "SUV", transmission: "CVT", drivetrain: "AWD", color: "Blue", source: "Cars.com", dealer: "Honda of Gainesville", dealerType: "dealer", score: 87, img: "🚙", zip: "32608" },
  { id: 3, year: 2022, make: "Hyundai", model: "Tucson SEL", price: 24200, mileage: 28000, fuel: "Hybrid", body: "SUV", transmission: "Automatic", drivetrain: "AWD", color: "Gray", source: "Autotrader", dealer: "Hyundai of North FL", dealerType: "dealer", score: 94, img: "🚙", zip: "32605" },
  { id: 4, year: 2019, make: "Mazda", model: "Mazda3 Hatchback", price: 18900, mileage: 52000, fuel: "Gasoline", body: "Hatchback", transmission: "Automatic", drivetrain: "FWD", color: "Red", source: "CarMax", dealer: "CarMax Jacksonville", dealerType: "dealer", score: 89, img: "🚗", zip: "32256" },
  { id: 5, year: 2021, make: "Tesla", model: "Model 3 SR+", price: 29500, mileage: 31000, fuel: "Electric", body: "Sedan", transmission: "Automatic", drivetrain: "RWD", color: "Black", source: "Carvana", dealer: "Carvana", dealerType: "dealer", score: 85, img: "🚗", zip: "32601" },
  { id: 6, year: 2020, make: "Subaru", model: "Outback Premium", price: 23400, mileage: 45000, fuel: "Gasoline", body: "Wagon", transmission: "CVT", drivetrain: "AWD", color: "Green", source: "TrueCar", dealer: "Subaru of Jacksonville", dealerType: "dealer", score: 91, img: "🚙", zip: "32225" },
  { id: 7, year: 2022, make: "Kia", model: "Forte GT", price: 19800, mileage: 22000, fuel: "Gasoline", body: "Sedan", transmission: "Automatic", drivetrain: "FWD", color: "White", source: "CarGurus", dealer: "Private Seller", dealerType: "private", score: 96, img: "🚗", zip: "32607" },
  { id: 8, year: 2018, make: "Ford", model: "F-150 XLT", price: 27500, mileage: 58000, fuel: "Gasoline", body: "Truck", transmission: "Automatic", drivetrain: "4WD", color: "Silver", source: "Facebook", dealer: "Private Seller", dealerType: "private", score: 83, img: "🛻", zip: "32603" },
];

function ScoreBar({ score }) {
  const color = score >= 90 ? "#16a34a" : score >= 80 ? "#ca8a04" : "#dc2626";
  const label = score >= 90 ? "Great Deal" : score >= 80 ? "Fair Deal" : "Overpriced";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#1a1a2e" }}>
        <div style={{ width: `${score}%`, height: "100%", borderRadius: 3, background: color, transition: "width 0.8s ease" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 0.5 }}>{score} — {label}</span>
    </div>
  );
}

function ToggleChip({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 16px", borderRadius: 8, border: "1.5px solid",
      borderColor: selected ? "#6ee7b7" : "#2a2a4a",
      background: selected ? "rgba(110,231,183,0.1)" : "rgba(255,255,255,0.02)",
      color: selected ? "#6ee7b7" : "#8888aa", cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: selected ? 600 : 400,
      transition: "all 0.2s ease", letterSpacing: 0.3,
    }}>
      {label}
    </button>
  );
}

function StepProgress({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 2,
          background: i <= current ? "linear-gradient(90deg, #6ee7b7, #3b82f6)" : "#1a1a2e",
          transition: "background 0.4s ease",
        }} />
      ))}
    </div>
  );
}

export default function AutoSage() {
  const [view, setView] = useState("home"); // home, wizard, results, guide, chat
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState({
    budgetMin: 10000, budgetMax: 30000,
    bodyTypes: [], fuelTypes: [], yearMin: 2018, yearMax: 2025,
    maxMileage: 80000, transmissions: [], drivetrains: [],
    features: [], brands: [], zip: "", radius: 50,
  });
  const [results, setResults] = useState([]);
  const [sortBy, setSortBy] = useState("score");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());
  const [fadeIn, setFadeIn] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    setFadeIn(false);
    const t = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(t);
  }, [view, step]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const toggle = (arr, val) => arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
  const setPref = (key, val) => setPrefs(p => ({ ...p, [key]: val }));

  const runSearch = () => {
    let filtered = [...MOCK_LISTINGS];
    if (prefs.bodyTypes.length) filtered = filtered.filter(l => prefs.bodyTypes.includes(l.body));
    if (prefs.fuelTypes.length) filtered = filtered.filter(l => prefs.fuelTypes.includes(l.fuel));
    if (prefs.brands.length) filtered = filtered.filter(l => prefs.brands.includes(l.make));
    if (prefs.transmissions.length) filtered = filtered.filter(l => prefs.transmissions.includes(l.transmission));
    if (prefs.drivetrains.length) filtered = filtered.filter(l => prefs.drivetrains.includes(l.drivetrain));
    filtered = filtered.filter(l => l.price >= prefs.budgetMin && l.price <= prefs.budgetMax);
    filtered = filtered.filter(l => l.mileage <= prefs.maxMileage);
    filtered = filtered.filter(l => l.year >= prefs.yearMin && l.year <= prefs.yearMax);
    setResults(filtered);
    setView("results");
  };

  const sorted = [...results].sort((a, b) => {
    if (sortBy === "score") return b.score - a.score;
    if (sortBy === "priceLow") return a.price - b.price;
    if (sortBy === "priceHigh") return b.price - a.price;
    if (sortBy === "mileage") return a.mileage - b.mileage;
    if (sortBy === "newest") return b.year - a.year;
    return 0;
  });

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setIsTyping(true);

    setTimeout(() => {
      // Simple RAG simulation — match keywords to topics
      const lower = userMsg.toLowerCase();
      let matched = null;
      const keywords = {
        inspection: ["inspect", "check", "ppi", "mechanic", "look for"],
        history: ["carfax", "autocheck", "history", "report", "vin"],
        redflags: ["red flag", "warning", "scam", "suspicious", "avoid"],
        negotiate: ["negotiat", "price", "offer", "deal", "haggle", "discount"],
        financing: ["financ", "loan", "apr", "interest", "payment", "credit"],
        titles: ["title", "salvage", "rebuilt", "flood", "lemon"],
        scams: ["scam", "fraud", "curbston", "fake", "trick"],
        testdrive: ["test drive", "driving", "test"],
        warranty: ["warranty", "cpo", "certified", "extended", "coverage"],
        postpurchase: ["after buy", "registr", "insurance", "post", "bought"],
        ev: ["electric", "ev", "battery", "charging", "hybrid", "tesla"],
        pricing: ["kbb", "kelley", "edmunds", "nada", "value", "worth", "pricing"],
      };
      for (const [topic, kws] of Object.entries(keywords)) {
        if (kws.some(kw => lower.includes(kw))) { matched = topic; break; }
      }
      let reply = matched
        ? `Based on our buying guide:\n\n${RAG_CONTENT[matched]}\n\n💡 *Want to know more? Ask me anything about buying a used car!*`
        : `Great question! Here are some general tips:\n\n1. **Always get a pre-purchase inspection** from an independent mechanic\n2. **Check the vehicle history** using Carfax and AutoCheck\n3. **Research fair market value** on KBB and Edmunds before negotiating\n4. **Get pre-approved for financing** before visiting a dealer\n\nTry asking me about specific topics like inspections, negotiation, financing, scams, or test drives!`;

      setChatMessages(prev => [...prev, { role: "assistant", text: reply }]);
      setIsTyping(false);
    }, 1200);
  };

  const containerStyle = {
    fontFamily: "'DM Sans', sans-serif",
    minHeight: "100vh",
    background: "linear-gradient(170deg, #0a0a1a 0%, #0d1117 40%, #0a0a1a 100%)",
    color: "#e4e4f0",
    position: "relative",
    overflow: "hidden",
  };

  const navStyle = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 24px", borderBottom: "1px solid rgba(110,231,183,0.08)",
    background: "rgba(10,10,26,0.8)", backdropFilter: "blur(20px)",
    position: "sticky", top: 0, zIndex: 100,
  };

  const navBtn = (label, target) => (
    <button onClick={() => { setView(target); if (target === "chat") setChatMessages(m => m.length ? m : [{ role: "assistant", text: "Hi! I'm your used car buying assistant. Ask me anything about buying a used car — inspections, financing, negotiation tips, common scams, or any other questions you have!" }]); }}
      style={{
        padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer",
        background: view === target ? "rgba(110,231,183,0.15)" : "transparent",
        color: view === target ? "#6ee7b7" : "#8888aa",
        fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
        transition: "all 0.2s",
      }}>
      {label}
    </button>
  );

  const cardStyle = {
    background: "linear-gradient(135deg, rgba(20,20,40,0.9), rgba(15,15,30,0.95))",
    border: "1px solid rgba(110,231,183,0.08)", borderRadius: 14,
    padding: 20, transition: "all 0.3s ease",
  };

  const btnPrimary = {
    padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer",
    background: "linear-gradient(135deg, #059669, #10b981)", color: "#fff",
    fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600,
    letterSpacing: 0.3, transition: "all 0.2s", boxShadow: "0 4px 20px rgba(16,185,129,0.25)",
  };

  const renderWizardStep = () => {
    const s = STEPS[step];
    const content = {
      budget: (
        <div>
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "#6ee7b7", fontWeight: 600, marginBottom: 6, display: "block" }}>MIN BUDGET</label>
              <input type="range" min={3000} max={80000} step={1000} value={prefs.budgetMin}
                onChange={e => setPref("budgetMin", +e.target.value)}
                style={{ width: "100%", accentColor: "#6ee7b7" }} />
              <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginTop: 4 }}>${prefs.budgetMin.toLocaleString()}</div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "#6ee7b7", fontWeight: 600, marginBottom: 6, display: "block" }}>MAX BUDGET</label>
              <input type="range" min={3000} max={100000} step={1000} value={prefs.budgetMax}
                onChange={e => setPref("budgetMax", +e.target.value)}
                style={{ width: "100%", accentColor: "#6ee7b7" }} />
              <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginTop: 4 }}>${prefs.budgetMax.toLocaleString()}</div>
            </div>
          </div>
        </div>
      ),
      bodyType: (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {BODY_TYPES.map(t => <ToggleChip key={t} label={t} selected={prefs.bodyTypes.includes(t)} onClick={() => setPref("bodyTypes", toggle(prefs.bodyTypes, t))} />)}
        </div>
      ),
      fuel: (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {FUEL_TYPES.map(t => <ToggleChip key={t} label={t} selected={prefs.fuelTypes.includes(t)} onClick={() => setPref("fuelTypes", toggle(prefs.fuelTypes, t))} />)}
        </div>
      ),
      year: (
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: "#6ee7b7", fontWeight: 600, marginBottom: 6, display: "block" }}>FROM YEAR</label>
            <input type="range" min={2005} max={2025} value={prefs.yearMin}
              onChange={e => setPref("yearMin", +e.target.value)}
              style={{ width: "100%", accentColor: "#6ee7b7" }} />
            <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginTop: 4 }}>{prefs.yearMin}</div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: "#6ee7b7", fontWeight: 600, marginBottom: 6, display: "block" }}>TO YEAR</label>
            <input type="range" min={2005} max={2025} value={prefs.yearMax}
              onChange={e => setPref("yearMax", +e.target.value)}
              style={{ width: "100%", accentColor: "#6ee7b7" }} />
            <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginTop: 4 }}>{prefs.yearMax}</div>
          </div>
        </div>
      ),
      mileage: (
        <div>
          <label style={{ fontSize: 12, color: "#6ee7b7", fontWeight: 600, marginBottom: 6, display: "block" }}>MAX MILEAGE</label>
          <input type="range" min={10000} max={200000} step={5000} value={prefs.maxMileage}
            onChange={e => setPref("maxMileage", +e.target.value)}
            style={{ width: "100%", accentColor: "#6ee7b7" }} />
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginTop: 4 }}>{prefs.maxMileage.toLocaleString()} miles</div>
        </div>
      ),
      transmission: (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {TRANSMISSIONS.map(t => <ToggleChip key={t} label={t} selected={prefs.transmissions.includes(t)} onClick={() => setPref("transmissions", toggle(prefs.transmissions, t))} />)}
        </div>
      ),
      drivetrain: (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {DRIVETRAINS.map(t => <ToggleChip key={t} label={t} selected={prefs.drivetrains.includes(t)} onClick={() => setPref("drivetrains", toggle(prefs.drivetrains, t))} />)}
        </div>
      ),
      features: (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {FEATURES.map(t => <ToggleChip key={t} label={t} selected={prefs.features.includes(t)} onClick={() => setPref("features", toggle(prefs.features, t))} />)}
        </div>
      ),
      brand: (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {BRANDS.map(t => <ToggleChip key={t} label={t} selected={prefs.brands.includes(t)} onClick={() => setPref("brands", toggle(prefs.brands, t))} />)}
        </div>
      ),
      location: (
        <div>
          <label style={{ fontSize: 12, color: "#6ee7b7", fontWeight: 600, marginBottom: 6, display: "block" }}>ZIP CODE</label>
          <input type="text" placeholder="e.g. 32601" value={prefs.zip}
            onChange={e => setPref("zip", e.target.value)}
            style={{
              width: "100%", padding: "12px 16px", borderRadius: 8, border: "1.5px solid #2a2a4a",
              background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 16,
              fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box",
            }} />
          <label style={{ fontSize: 12, color: "#6ee7b7", fontWeight: 600, marginBottom: 6, display: "block", marginTop: 16 }}>SEARCH RADIUS</label>
          <input type="range" min={10} max={500} step={10} value={prefs.radius}
            onChange={e => setPref("radius", +e.target.value)}
            style={{ width: "100%", accentColor: "#6ee7b7" }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 4 }}>{prefs.radius} miles</div>
        </div>
      ),
    };
    return (
      <div style={{ opacity: fadeIn ? 1 : 0, transform: fadeIn ? "translateY(0)" : "translateY(12px)", transition: "all 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 28 }}>{s.icon}</span>
          <div>
            <div style={{ fontSize: 11, color: "#6ee7b7", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>Step {step + 1} of {STEPS.length}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{s.label}</div>
          </div>
        </div>
        {content[s.key]}
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      {/* Ambient glow */}
      <div style={{ position: "fixed", top: -200, right: -200, width: 500, height: 500, background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -300, left: -200, width: 600, height: 600, background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Nav */}
      <nav style={navStyle}>
        <div onClick={() => setView("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20, filter: "drop-shadow(0 0 6px rgba(16,185,129,0.4))" }}>🔮</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 17, color: "#6ee7b7", letterSpacing: -0.5 }}>AutoSage</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {navBtn("Search", "wizard")}
          {navBtn("Guide", "guide")}
          {navBtn("Ask AI", "chat")}
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px 60px" }}>
        {/* HOME */}
        {view === "home" && (
          <div style={{ textAlign: "center", paddingTop: 60, opacity: fadeIn ? 1 : 0, transition: "opacity 0.5s" }}>
            <div style={{ fontSize: 52, marginBottom: 16, filter: "drop-shadow(0 0 20px rgba(16,185,129,0.3))" }}>🔮</div>
            <h1 style={{ fontFamily: "'Space Mono', monospace", fontSize: 36, fontWeight: 700, color: "#fff", margin: "0 0 12px", lineHeight: 1.2 }}>
              Buy your next car<br /><span style={{ color: "#6ee7b7" }}>with confidence</span>
            </h1>
            <p style={{ color: "#8888aa", fontSize: 16, maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.6 }}>
              AI-powered search across every major marketplace. Expert buying guidance at your fingertips. No dealership pressure.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => { setStep(0); setView("wizard"); }} style={btnPrimary}>
                Find My Car →
              </button>
              <button onClick={() => setView("guide")} style={{
                ...btnPrimary, background: "transparent", border: "1.5px solid rgba(110,231,183,0.3)",
                color: "#6ee7b7", boxShadow: "none",
              }}>
                Buying Guide
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 60, textAlign: "left" }}>
              {[
                { icon: "🔍", title: "Smart Search", desc: "Searches 8+ marketplaces and scores every deal" },
                { icon: "🤖", title: "AI Assistant", desc: "Ask anything about the car buying process" },
                { icon: "📚", title: "Expert Guide", desc: "Curated knowledge base from inspection to purchase" },
              ].map((f, i) => (
                <div key={i} style={{ ...cardStyle, textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 6 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: "#8888aa", lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WIZARD */}
        {view === "wizard" && (
          <div>
            <StepProgress current={step} total={STEPS.length} />
            <div style={cardStyle}>
              {renderWizardStep()}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, gap: 12 }}>
                <button onClick={() => step > 0 ? setStep(step - 1) : setView("home")} style={{
                  padding: "10px 20px", borderRadius: 8, border: "1px solid #2a2a4a", background: "transparent",
                  color: "#8888aa", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                }}>
                  ← Back
                </button>
                {step < STEPS.length - 1 ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setStep(step + 1)} style={{
                      padding: "10px 16px", borderRadius: 8, border: "1px solid #2a2a4a", background: "transparent",
                      color: "#6ee7b7", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                    }}>
                      Skip
                    </button>
                    <button onClick={() => setStep(step + 1)} style={{ ...btnPrimary, padding: "10px 24px", fontSize: 14 }}>
                      Next →
                    </button>
                  </div>
                ) : (
                  <button onClick={runSearch} style={{ ...btnPrimary, padding: "10px 28px", fontSize: 14 }}>
                    🔍 Search Cars
                  </button>
                )}
              </div>
            </div>
            {/* Quick nav dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
              {STEPS.map((s, i) => (
                <button key={i} onClick={() => setStep(i)} title={s.label}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: "1px solid",
                    borderColor: i === step ? "#6ee7b7" : "#1a1a2e", cursor: "pointer", fontSize: 14,
                    background: i === step ? "rgba(110,231,183,0.1)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                  {s.icon}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RESULTS */}
        {view === "results" && (
          <div style={{ opacity: fadeIn ? 1 : 0, transition: "opacity 0.4s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 }}>
                  {sorted.length} cars found
                </h2>
                <p style={{ fontSize: 13, color: "#6ee7b7", margin: "4px 0 0" }}>AI-scored and ranked for you</p>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#8888aa" }}>Sort:</span>
                {[
                  ["score", "Best Deal"], ["priceLow", "Price ↑"], ["priceHigh", "Price ↓"], ["mileage", "Low Miles"], ["newest", "Newest"]
                ].map(([val, label]) => (
                  <button key={val} onClick={() => setSortBy(val)} style={{
                    padding: "5px 10px", borderRadius: 6, border: "1px solid",
                    borderColor: sortBy === val ? "#6ee7b7" : "#1a1a2e",
                    background: sortBy === val ? "rgba(110,231,183,0.1)" : "transparent",
                    color: sortBy === val ? "#6ee7b7" : "#8888aa",
                    cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                  }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => { setStep(0); setView("wizard"); }} style={{
              padding: "6px 14px", borderRadius: 6, border: "1px solid #2a2a4a",
              background: "transparent", color: "#8888aa", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 12, marginBottom: 16,
            }}>
              ← Modify Search
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sorted.map(car => (
                <div key={car.id} style={{
                  ...cardStyle, display: "grid", gridTemplateColumns: "60px 1fr auto", gap: 16, alignItems: "start",
                  cursor: "default",
                }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: 10, background: "rgba(110,231,183,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30,
                  }}>
                    {car.img}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>
                      {car.year} {car.make} {car.model}
                    </div>
                    <div style={{ fontSize: 12, color: "#8888aa", marginTop: 4, display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <span>{car.mileage.toLocaleString()} mi</span>
                      <span>{car.fuel}</span>
                      <span>{car.transmission}</span>
                      <span>{car.drivetrain}</span>
                      <span>{car.color}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      {car.dealer} • via {car.source} • {car.dealerType === "dealer" ? "Dealer" : "Private"}
                    </div>
                    <ScoreBar score={car.score} />
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 20, fontWeight: 700, color: "#6ee7b7" }}>
                      ${car.price.toLocaleString()}
                    </div>
                    <button onClick={() => setSavedIds(prev => {
                      const next = new Set(prev);
                      next.has(car.id) ? next.delete(car.id) : next.add(car.id);
                      return next;
                    })} style={{
                      marginTop: 8, padding: "4px 10px", borderRadius: 6, border: "1px solid #2a2a4a",
                      background: savedIds.has(car.id) ? "rgba(110,231,183,0.1)" : "transparent",
                      color: savedIds.has(car.id) ? "#6ee7b7" : "#8888aa",
                      cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                    }}>
                      {savedIds.has(car.id) ? "★ Saved" : "☆ Save"}
                    </button>
                  </div>
                </div>
              ))}
              {sorted.length === 0 && (
                <div style={{ ...cardStyle, textAlign: "center", padding: 40 }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                  <div style={{ color: "#8888aa", fontSize: 15 }}>No cars match your criteria. Try widening your search.</div>
                  <button onClick={() => { setStep(0); setView("wizard"); }} style={{ ...btnPrimary, marginTop: 16, fontSize: 14, padding: "10px 24px" }}>
                    Adjust Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BUYING GUIDE */}
        {view === "guide" && (
          <div style={{ opacity: fadeIn ? 1 : 0, transition: "opacity 0.4s" }}>
            {!selectedTopic ? (
              <>
                <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>
                  Used Car Buying Guide
                </h2>
                <p style={{ color: "#8888aa", fontSize: 14, margin: "0 0 24px" }}>
                  Everything you need to know, curated by our AI from trusted sources
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
                  {RAG_TOPICS.map(topic => (
                    <button key={topic.id} onClick={() => setSelectedTopic(topic.id)} style={{
                      ...cardStyle, cursor: "pointer", textAlign: "left", border: "1px solid rgba(110,231,183,0.06)",
                    }}>
                      <div style={{ fontSize: 26, marginBottom: 8 }}>{topic.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 4 }}>{topic.title}</div>
                      <div style={{ fontSize: 12, color: "#8888aa", lineHeight: 1.5 }}>{topic.desc}</div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div>
                <button onClick={() => setSelectedTopic(null)} style={{
                  padding: "6px 14px", borderRadius: 6, border: "1px solid #2a2a4a",
                  background: "transparent", color: "#6ee7b7", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 20,
                }}>
                  ← All Topics
                </button>
                <div style={cardStyle}>
                  <div style={{ fontSize: 30, marginBottom: 12 }}>{RAG_TOPICS.find(t => t.id === selectedTopic)?.icon}</div>
                  <div style={{
                    fontSize: 14, color: "#c8c8d8", lineHeight: 1.8, whiteSpace: "pre-wrap",
                  }}>
                    {RAG_CONTENT[selectedTopic]?.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                      part.startsWith("**") && part.endsWith("**")
                        ? <strong key={i} style={{ color: "#fff" }}>{part.slice(2, -2)}</strong>
                        : <span key={i}>{part}</span>
                    )}
                  </div>
                  <div style={{
                    marginTop: 20, padding: "12px 16px", borderRadius: 8,
                    background: "rgba(110,231,183,0.05)", border: "1px solid rgba(110,231,183,0.1)",
                  }}>
                    <span style={{ fontSize: 12, color: "#6ee7b7" }}>💡 Have questions? </span>
                    <button onClick={() => { setView("chat"); setChatMessages(m => m.length ? m : [{ role: "assistant", text: "Hi! I'm your used car buying assistant. Ask me anything!" }]); }}
                      style={{ fontSize: 12, color: "#6ee7b7", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                      Ask our AI assistant →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CHAT */}
        {view === "chat" && (
          <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)", opacity: fadeIn ? 1 : 0, transition: "opacity 0.4s" }}>
            <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>
              🤖 Buying Assistant
            </h2>
            <p style={{ color: "#8888aa", fontSize: 13, margin: "0 0 16px" }}>Powered by RAG + Claude AI</p>
            <div style={{
              flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12,
              padding: "12px 0", minHeight: 0,
            }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  padding: "12px 16px", borderRadius: 12,
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #059669, #10b981)"
                    : "rgba(20,20,40,0.9)",
                  border: msg.role === "user" ? "none" : "1px solid rgba(110,231,183,0.08)",
                  color: msg.role === "user" ? "#fff" : "#c8c8d8",
                  fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap",
                }}>
                  {msg.text.split(/(\*\*.*?\*\*)/g).map((part, j) =>
                    part.startsWith("**") && part.endsWith("**")
                      ? <strong key={j} style={{ color: msg.role === "user" ? "#fff" : "#fff" }}>{part.slice(2, -2)}</strong>
                      : <span key={j}>{part}</span>
                  )}
                </div>
              ))}
              {isTyping && (
                <div style={{
                  alignSelf: "flex-start", padding: "12px 16px", borderRadius: 12,
                  background: "rgba(20,20,40,0.9)", border: "1px solid rgba(110,231,183,0.08)",
                  color: "#6ee7b7", fontSize: 13,
                }}>
                  Thinking...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: "1px solid rgba(110,231,183,0.08)" }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleChat()}
                placeholder="Ask about inspections, financing, scams..."
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: 10, border: "1.5px solid #2a2a4a",
                  background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif", outline: "none",
                }} />
              <button onClick={handleChat} style={{ ...btnPrimary, padding: "12px 20px", fontSize: 14 }}>
                Send
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {["How do I negotiate?", "What to check on a test drive?", "Is a salvage title bad?", "How does EV financing work?"].map(q => (
                <button key={q} onClick={() => { setChatInput(q); }}
                  style={{
                    padding: "4px 10px", borderRadius: 6, border: "1px solid #1a1a2e",
                    background: "rgba(110,231,183,0.04)", color: "#6ee7b7",
                    cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                  }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
