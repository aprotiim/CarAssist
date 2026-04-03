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
          <h2 className="font-mono text-[22px] font-bold text-white mb-1.5">
            Used Car Buying Guide
          </h2>
          <p className="text-muted text-sm mb-6">
            Everything you need to know, curated by AI from trusted sources
          </p>

          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
            {RAG_TOPICS.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className="card text-left hover:border-sage-300/20 hover:bg-sage-300/5 cursor-pointer"
              >
                <p className="text-[26px] mb-2">{t.icon}</p>
                <p className="font-bold text-sm text-white mb-1">{t.title}</p>
                <p className="text-xs text-muted leading-relaxed">{t.desc}</p>
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
            <p className="text-[30px] mb-3">{topic?.icon}</p>
            <h2 className="font-mono text-xl font-bold text-white mb-4">{topic?.title}</h2>
            <div className="text-sm text-dim leading-loose whitespace-pre-wrap">
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
