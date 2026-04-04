import { NextRequest, NextResponse } from "next/server";
import type { Preferences } from "@/lib/types";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const prefs: Preferences = await req.json();

    const backendRes = await fetch(`${BACKEND}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        budget_min: prefs.budgetMin,
        budget_max: prefs.budgetMax,
        body_types: prefs.bodyTypes,
        fuel_types: prefs.fuelTypes,
        max_mileage: prefs.maxMileage,
        year_min: prefs.yearMin,
        year_max: prefs.yearMax,
        transmissions: prefs.transmissions,
        drivetrains: prefs.drivetrains,
        brands: prefs.brands,
        zip_code: prefs.zip,
        radius_miles: prefs.radius,
      }),
    });

    if (!backendRes.ok) {
      throw new Error(`Backend error: ${backendRes.status}`);
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
