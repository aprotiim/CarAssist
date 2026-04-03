"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import { usePreferences } from "@/lib/preferences-context";
import type { SortOption } from "@/lib/types";
import { useState } from "react";

const SORT_OPTIONS: { val: SortOption; label: string }[] = [
  { val: "score",     label: "Best Deal" },
  { val: "priceLow",  label: "Price ↑"   },
  { val: "priceHigh", label: "Price ↓"   },
  { val: "mileage",   label: "Low Miles" },
  { val: "newest",    label: "Newest"    },
];

export default function ResultsPage() {
  const router = useRouter();
  const { results, savedIds, toggleSaved } = usePreferences();
  const [sortBy, setSortBy] = useState<SortOption>("score");

  useEffect(() => {
    if (results.length === 0) router.replace("/wizard");
  }, [results, router]);

  const sorted = [...results].sort((a, b) => {
    if (sortBy === "score")     return b.score - a.score;
    if (sortBy === "priceLow")  return a.price - b.price;
    if (sortBy === "priceHigh") return b.price - a.price;
    if (sortBy === "mileage")   return a.mileage - b.mileage;
    if (sortBy === "newest")    return b.year - a.year;
    return 0;
  });

  return (
    <div>
      {/* Header row */}
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <div>
          <h2 className="font-mono text-[22px] font-bold text-white">{sorted.length} cars found</h2>
          <p className="text-xs text-sage-300 mt-1">AI-scored and ranked for you</p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted">Sort:</span>
          {SORT_OPTIONS.map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setSortBy(val)}
              className={`px-2.5 py-1 rounded-md border text-xs transition-all ${
                sortBy === val
                  ? "border-sage-300 bg-sage-300/10 text-sage-300"
                  : "border-dark-500 bg-transparent text-muted hover:border-dark-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Link href="/wizard" className="btn-ghost inline-block text-xs mb-4">
        ← Modify Search
      </Link>

      {/* Listing cards */}
      <div className="flex flex-col gap-3">
        {sorted.map(car => (
          <ListingCard
            key={car.id}
            car={car}
            saved={savedIds.has(car.id)}
            onToggleSave={() => toggleSaved(car.id)}
          />
        ))}

        {sorted.length === 0 && (
          <div className="card text-center py-10">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-muted text-[15px]">No cars match your criteria. Try widening your search.</p>
            <Link href="/wizard" className="btn-primary inline-block mt-4 text-sm px-6 py-2.5">
              Adjust Filters
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
