import { NextRequest, NextResponse } from "next/server";
import { MOCK_LISTINGS } from "@/lib/constants";
import type { Preferences } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const prefs: Preferences = await req.json();
    let filtered = [...MOCK_LISTINGS];

    if (prefs.bodyTypes?.length)     filtered = filtered.filter(l => prefs.bodyTypes.includes(l.body));
    if (prefs.fuelTypes?.length)     filtered = filtered.filter(l => prefs.fuelTypes.includes(l.fuel));
    if (prefs.brands?.length)        filtered = filtered.filter(l => prefs.brands.includes(l.make));
    if (prefs.transmissions?.length) filtered = filtered.filter(l => prefs.transmissions.includes(l.transmission));
    if (prefs.drivetrains?.length)   filtered = filtered.filter(l => prefs.drivetrains.includes(l.drivetrain));

    filtered = filtered.filter(l =>
      l.price >= (prefs.budgetMin ?? 0) &&
      l.price <= (prefs.budgetMax ?? Infinity) &&
      l.mileage <= (prefs.maxMileage ?? Infinity) &&
      l.year >= (prefs.yearMin ?? 0) &&
      l.year <= (prefs.yearMax ?? 9999)
    );

    return NextResponse.json({ listings: filtered, total: filtered.length });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
