"use client";

import React, { createContext, useContext, useState } from "react";
import type { Preferences, Listing } from "./types";
import { DEFAULT_PREFERENCES } from "./constants";

interface PreferencesContextValue {
  prefs: Preferences;
  setPref: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  toggle: (arr: string[], val: string) => string[];
  results: Listing[];
  setResults: (listings: Listing[]) => void;
  savedIds: Set<number>;
  toggleSaved: (id: number) => void;
  step: number;
  setStep: (n: number) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [results, setResults] = useState<Listing[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [step, setStep] = useState(0);

  const setPref = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPrefs((p) => ({ ...p, [key]: value }));
  };

  const toggle = (arr: string[], val: string): string[] =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const toggleSaved = (id: number) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <PreferencesContext.Provider
      value={{ prefs, setPref, toggle, results, setResults, savedIds, toggleSaved, step, setStep }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}
