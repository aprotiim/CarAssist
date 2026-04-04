"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import { usePreferences } from "@/lib/preferences-context";
import type { SortOption } from "@/lib/types";

const PAGE_SIZE = 10;

const SORT_OPTIONS: { val: SortOption; label: string }[] = [
  { val: "score",     label: "Best Deal" },
  { val: "priceLow",  label: "Price ↑"   },
  { val: "priceHigh", label: "Price ↓"   },
  { val: "mileage",   label: "Low Miles" },
  { val: "newest",    label: "Newest"    },
];

export default function ResultsPage() {
  const router = useRouter();
  const { results, savedIds, toggleSaved, totalResults, sourcesSearched } = usePreferences();
  const [sortBy, setSortBy] = useState<SortOption>("score");
  const [visible, setVisible] = useState(PAGE_SIZE);

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

  const shown = sorted.slice(0, visible);
  const hasMore = visible < sorted.length;

  return (
    <div>
      {/* Stats banner */}
      <div className="card mb-5 flex items-center justify-between gap-4 flex-wrap py-3.5">
        <div className="flex items-center gap-5">
          <div className="text-center">
            <p className="font-mono text-3xl font-bold text-sage-300">{totalResults}</p>
            <p className="text-sm text-muted">matches found</p>
          </div>
          <div className="w-px h-10 bg-sage-300/10" />
          <div className="text-center">
            <p className="font-mono text-3xl font-bold text-white">{sourcesSearched}</p>
            <p className="text-sm text-muted">sites searched</p>
          </div>
          <div className="w-px h-10 bg-sage-300/10" />
          <div className="text-center">
            <p className="font-mono text-3xl font-bold text-white">{shown.length}</p>
            <p className="text-sm text-muted">showing now</p>
          </div>
        </div>
        <p className="text-xs text-sage-300 font-medium">
          AI-scored · ranked by best deal
        </p>
      </div>

      {/* Sort + modify */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <Link href="/wizard" className="btn-ghost inline-block text-xs">
          ← Modify Search
        </Link>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted">Sort:</span>
          {SORT_OPTIONS.map(({ val, label }) => (
            <button
              key={val}
              onClick={() => { setSortBy(val); setVisible(PAGE_SIZE); }}
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

      {/* Listing cards */}
      <div className="flex flex-col gap-3">
        {shown.map((car, i) => (
          <ListingCard
            key={`${car.id}-${i}`}
            car={car}
            saved={savedIds.has(car.id)}
            onToggleSave={() => toggleSaved(car.id)}
          />
        ))}

        {sorted.length === 0 && (
          <div className="card text-center py-10">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-muted text-lg">No cars match your criteria. Try widening your search.</p>
            <Link href="/wizard" className="btn-primary inline-block mt-4 text-sm px-6 py-2.5">
              Adjust Filters
            </Link>
          </div>
        )}
      </div>

      {/* View more */}
      {hasMore && (
        <div className="text-center mt-6">
          <p className="text-xs text-muted mb-3">
            Showing {shown.length} of {sorted.length} listings
          </p>
          <button
            onClick={() => setVisible(v => v + PAGE_SIZE)}
            className="btn-outline px-8 py-2.5 text-sm"
          >
            View more ({sorted.length - visible} remaining)
          </button>
        </div>
      )}

      {!hasMore && sorted.length > 0 && (
        <p className="text-center text-xs text-muted mt-6">
          All {sorted.length} listings shown
        </p>
      )}
    </div>
  );
}
