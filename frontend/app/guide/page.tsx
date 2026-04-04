"use client";

import { useState } from "react";
import Link from "next/link";
import { RAG_TOPICS, RAG_CONTENT } from "@/lib/constants";

function renderMarkdown(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="text-white">{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function GuidePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const topic = RAG_TOPICS.find(t => t.id === selectedId);

  return (
    <div>
      {!selectedId ? (
        <>
          <h2 className="font-mono text-3xl font-bold text-white mb-2">
            Used Car Buying Guide
          </h2>
          <p className="text-muted text-base mb-6">
            Everything you need to know, curated by AI from trusted sources
          </p>

          {/* Preliminary steps */}
          <div className="card mb-6">
            <h3 className="font-mono text-xl font-bold text-white mb-4">
              Before You Buy — 4 Essential Steps
            </h3>
            <div className="flex flex-col gap-4">
              {[
                {
                  icon: "💬",
                  step: "1. Request the VIN",
                  desc: "Message the seller and ask for the 17-digit VIN. Use it to verify the title status and run a vehicle history report. If a seller refuses, walk away.",
                },
                {
                  icon: "📑",
                  step: "2. Verify with NHTSA",
                  desc: "Use the free NHTSA vPIC tool (vpic.nhtsa.dot.gov) to confirm the VIN matches the car's factory specs — year, make, and model.",
                },
                {
                  icon: "🛠️",
                  step: "3. Get a Pre-Purchase Inspection",
                  desc: "Book a PPI at an independent mechanic before handing over any money. A $100–200 inspection can reveal hidden leaks, frame damage, or engine issues.",
                },
                {
                  icon: "🤝",
                  step: "4. Close Securely",
                  desc: "Finalize the transaction at a bank or your local DMV. Verify the seller's government-issued ID matches the name on the title before signing anything.",
                },
              ].map(({ icon, step, desc }) => (
                <div key={step} className="flex gap-3 items-start">
                  <span className="text-2xl mt-0.5">{icon}</span>
                  <div>
                    <p className="text-base font-semibold text-white">{step}</p>
                    <p className="text-sm text-muted leading-relaxed mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
            {RAG_TOPICS.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className="card text-left hover:border-sage-300/20 hover:bg-sage-300/5 cursor-pointer"
              >
                <p className="text-4xl mb-3">{t.icon}</p>
                <p className="font-bold text-base text-white mb-1.5">{t.title}</p>
                <p className="text-sm text-muted leading-relaxed">{t.desc}</p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div>
          <button
            onClick={() => setSelectedId(null)}
            className="btn-ghost text-sage-300 border-sage-300/20 text-sm mb-5"
          >
            ← All Topics
          </button>

          <div className="card">
            <p className="text-5xl mb-4">{topic?.icon}</p>
            <h2 className="font-mono text-2xl font-bold text-white mb-4">{topic?.title}</h2>
            <div className="text-base text-dim leading-loose whitespace-pre-wrap">
              {renderMarkdown(RAG_CONTENT[selectedId] ?? "")}
            </div>

            <div className="mt-5 px-4 py-3 rounded-lg bg-sage-300/[0.05] border border-sage-300/10">
              <span className="text-xs text-sage-300">💡 Have questions? </span>
              <Link href="/chat" className="text-xs text-sage-300 underline">
                Ask our AI assistant →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
