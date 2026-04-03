import Link from "next/link";

export default function HomePage() {
  return (
    <div className="text-center pt-16">
      {/* Hero */}
      <div
        className="text-[52px] mb-4"
        style={{ filter: "drop-shadow(0 0 20px rgba(16,185,129,0.3))" }}
      >
        🔮
      </div>
      <h1 className="font-mono text-4xl font-bold text-white leading-tight mb-3">
        Buy your next car
        <br />
        <span className="text-sage-300">with confidence</span>
      </h1>
      <p className="text-muted text-base max-w-md mx-auto mb-10 leading-relaxed">
        AI-powered search across every major marketplace. Expert buying guidance at your fingertips.
        No dealership pressure.
      </p>

      <div className="flex gap-3 justify-center flex-wrap mb-16">
        <Link href="/wizard" className="btn-primary">
          Find My Car →
        </Link>
        <Link href="/guide" className="btn-outline">
          Buying Guide
        </Link>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-3 gap-4 text-left max-sm:grid-cols-1">
        {[
          {
            icon: "🔍",
            title: "Smart Search",
            desc: "Searches 8+ marketplaces and scores every deal with AI",
          },
          {
            icon: "🤖",
            title: "AI Assistant",
            desc: "Ask anything about the car buying process — 24/7",
          },
          {
            icon: "📚",
            title: "Expert Guide",
            desc: "Curated knowledge base from inspection to purchase",
          },
        ].map((f) => (
          <div key={f.title} className="card text-center">
            <div className="text-3xl mb-2.5">{f.icon}</div>
            <p className="font-bold text-[15px] text-white mb-1.5">{f.title}</p>
            <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mt-6 max-sm:grid-cols-1">
        {[
          { stat: "8+",    label: "Marketplaces searched"  },
          { stat: "15+",   label: "Expert buying guides"   },
          { stat: "100%",  label: "Free to use"            },
        ].map((s) => (
          <div key={s.stat} className="card text-center py-4">
            <p className="font-mono text-2xl font-bold text-sage-300">{s.stat}</p>
            <p className="text-xs text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
