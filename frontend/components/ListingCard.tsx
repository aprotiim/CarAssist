"use client";

import ScoreBar from "./ScoreBar";
import type { Listing } from "@/lib/types";

interface ListingCardProps {
  car: Listing;
  saved: boolean;
  onToggleSave: () => void;
}

export default function ListingCard({ car, saved, onToggleSave }: ListingCardProps) {
  return (
    <a
      href={car.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card grid gap-4 items-start hover:border-sage-300/40 transition-colors cursor-pointer"
      style={{ gridTemplateColumns: "60px 1fr auto" }}
    >
      {/* Icon */}
      <div className="w-[60px] h-[60px] rounded-xl bg-sage-300/5 flex items-center justify-center text-3xl">
        {car.img}
      </div>

      {/* Details */}
      <div>
        <p className="font-bold text-base text-white">
          {car.year} {car.make} {car.model}
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-muted mt-1">
          <span>{car.mileage.toLocaleString()} mi</span>
          <span>{car.fuel}</span>
          <span>{car.transmission}</span>
          <span>{car.drivetrain}</span>
          <span>{car.color}</span>
        </div>
        <p className="text-xs text-dark-300 mt-1">
          {car.dealer} · via {car.source} · {car.dealerType === "dealer" ? "Dealer" : "Private"}
          {car.url && (
            <span className="ml-2 text-sage-300/60">
              · {car.url.includes("search") || car.url.includes("shopping") || car.url.includes("cars-for-sale") || car.url.includes("/cars/") ? "Search on site →" : "View listing →"}
            </span>
          )}
        </p>
        <ScoreBar score={car.score} />
      </div>

      {/* Price + save */}
      <div className="text-right">
        <p className="font-mono text-xl font-bold text-sage-300">
          ${car.price.toLocaleString()}
        </p>
        <button
          onClick={(e) => { e.preventDefault(); onToggleSave(); }}
          className={`mt-2 px-2.5 py-1 rounded-md border text-xs transition-all ${
            saved
              ? "border-dark-400 bg-sage-300/10 text-sage-300"
              : "border-dark-500 bg-transparent text-muted hover:border-dark-300"
          }`}
        >
          {saved ? "★ Saved" : "☆ Save"}
        </button>
      </div>
    </a>
  );
}
