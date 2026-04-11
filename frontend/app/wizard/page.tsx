"use client";

import { useRouter } from "next/navigation";
import StepProgress from "@/components/StepProgress";
import ToggleChip from "@/components/ToggleChip";
import { usePreferences } from "@/lib/preferences-context";
import {
  WIZARD_STEPS, BODY_TYPES, FUEL_TYPES, TRANSMISSIONS,
  DRIVETRAINS, FEATURES, BRANDS,
} from "@/lib/constants";
import { useState } from "react";

export default function WizardPage() {
  const router = useRouter();
  const { prefs, setPref, toggle, step, setStep, setResults, setSearchMeta } = usePreferences();
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const runSearch = async () => {
    if (!prefs.zip.trim()) {
      setSearchError("Zip code is required to search.");
      return;
    }
    if (!/^\d{5}$/.test(prefs.zip.trim())) {
      setSearchError("Please enter a valid 5-digit zip code.");
      return;
    }
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data.listings || []);
      setSearchMeta(data.total || 0, data.sources_searched || 0);
      router.push("/results");
    } catch {
      setSearchError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const s = WIZARD_STEPS[step];

  const stepContent: Record<string, React.ReactNode> = {
    budget: (
      <div className="flex gap-4">
        {(["budgetMin", "budgetMax"] as const).map((key, idx) => (
          <div key={key} className="flex-1">
            <label className="label">{idx === 0 ? "Min Budget" : "Max Budget"}</label>
            <input
              type="range"
              min={3000}
              max={idx === 0 ? 80000 : 100000}
              step={1000}
              value={prefs[key]}
              onChange={e => setPref(key, +e.target.value)}
              className="w-full"
            />
            <p className="text-3xl font-bold text-white mt-1">${prefs[key].toLocaleString()}</p>
          </div>
        ))}
      </div>
    ),
    bodyType: (
      <div className="flex flex-wrap gap-2">
        {BODY_TYPES.map(t => (
          <ToggleChip key={t} label={t} selected={prefs.bodyTypes.includes(t)}
            onClick={() => setPref("bodyTypes", toggle(prefs.bodyTypes, t))} />
        ))}
      </div>
    ),
    fuel: (
      <div className="flex flex-wrap gap-2">
        {FUEL_TYPES.map(t => (
          <ToggleChip key={t} label={t} selected={prefs.fuelTypes.includes(t)}
            onClick={() => setPref("fuelTypes", toggle(prefs.fuelTypes, t))} />
        ))}
      </div>
    ),
    year: (
      <div className="flex gap-4">
        {(["yearMin", "yearMax"] as const).map((key, idx) => (
          <div key={key} className="flex-1">
            <label className="label">{idx === 0 ? "From Year" : "To Year"}</label>
            <input type="range" min={2005} max={2025} value={prefs[key]}
              onChange={e => setPref(key, +e.target.value)} className="w-full" />
            <p className="text-3xl font-bold text-white mt-1">{prefs[key]}</p>
          </div>
        ))}
      </div>
    ),
    mileage: (
      <div>
        <label className="label">Max Mileage</label>
        <input type="range" min={10000} max={200000} step={5000} value={prefs.maxMileage}
          onChange={e => setPref("maxMileage", +e.target.value)} className="w-full" />
        <p className="text-3xl font-bold text-white mt-1">{prefs.maxMileage.toLocaleString()} miles</p>
      </div>
    ),
    transmission: (
      <div className="flex flex-wrap gap-2">
        {TRANSMISSIONS.map(t => (
          <ToggleChip key={t} label={t} selected={prefs.transmissions.includes(t)}
            onClick={() => setPref("transmissions", toggle(prefs.transmissions, t))} />
        ))}
      </div>
    ),
    drivetrain: (
      <div className="flex flex-wrap gap-2">
        {DRIVETRAINS.map(t => (
          <ToggleChip key={t} label={t} selected={prefs.drivetrains.includes(t)}
            onClick={() => setPref("drivetrains", toggle(prefs.drivetrains, t))} />
        ))}
      </div>
    ),
    features: (
      <div className="flex flex-wrap gap-2">
        {FEATURES.map(t => (
          <ToggleChip key={t} label={t} selected={prefs.features.includes(t)}
            onClick={() => setPref("features", toggle(prefs.features, t))} />
        ))}
      </div>
    ),
    brand: (
      <div className="flex flex-wrap gap-2">
        {BRANDS.map(t => (
          <ToggleChip key={t} label={t} selected={prefs.brands.includes(t)}
            onClick={() => setPref("brands", toggle(prefs.brands, t))} />
        ))}
      </div>
    ),
    location: (
      <div>
        <label className="label">
          Zip Code <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. 32601"
          value={prefs.zip}
          onChange={e => setPref("zip", e.target.value)}
          className={`input-field mb-1 ${!prefs.zip.trim() ? "border-red-400/50" : ""}`}
          maxLength={5}
          inputMode="numeric"
          pattern="\d{5}"
        />
        {!prefs.zip.trim() && (
          <p className="text-red-400 text-xs mb-3">Required — used to find cars near you</p>
        )}
        {prefs.zip.trim() && !/^\d{5}$/.test(prefs.zip.trim()) && (
          <p className="text-red-400 text-xs mb-3">Enter a valid 5-digit zip code</p>
        )}
        <div className="mb-4" />
        <label className="label">Search Radius</label>
        <input type="range" min={10} max={500} step={10} value={prefs.radius}
          onChange={e => setPref("radius", +e.target.value)} className="w-full" />
        <p className="text-3xl font-bold text-white mt-1">{prefs.radius} miles</p>
      </div>
    ),
  };

  return (
    <div>
      <StepProgress current={step} total={WIZARD_STEPS.length} />

      <div className="card">
        {/* Step header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">{s.icon}</span>
          <div>
            <p className="text-sm text-sage-300 font-semibold tracking-widest uppercase">
              Step {step + 1} of {WIZARD_STEPS.length}
            </p>
            <p className="text-3xl font-bold text-white">{s.label}</p>
          </div>
        </div>

        {stepContent[s.key]}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6 gap-3">
          <button
            onClick={() => (step > 0 ? setStep(step - 1) : router.push("/"))}
            className="btn-ghost"
          >
            ← Back
          </button>

          {step < WIZARD_STEPS.length - 1 ? (
            <div className="flex gap-2">
              <button onClick={() => setStep(step + 1)} className="btn-ghost text-sage-300 border-sage-300/20">
                Skip
              </button>
              <button onClick={() => setStep(step + 1)} className="btn-primary px-6 py-2 text-sm">
                Next →
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-1">
              {searchError && <p className="text-red-400 text-xs">{searchError}</p>}
              <button
                onClick={runSearch}
                disabled={searching}
                className="btn-primary px-7 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {searching ? "Searching..." : "🔍 Search Cars"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Step dot navigation */}
      <div className="flex justify-center gap-2 mt-5">
        {WIZARD_STEPS.map((ws, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            title={ws.label}
            className={`w-7 h-7 rounded-md border flex items-center justify-center text-sm transition-all ${
              i === step
                ? "border-sage-300 bg-sage-300/10"
                : "border-dark-500 bg-transparent"
            }`}
          >
            {ws.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
