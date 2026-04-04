import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      {/* Logo */}
      <div className="mb-8">
        <svg viewBox="0 0 88 88" width="96" height="96" aria-hidden="true" className="mx-auto mb-5"
          style={{ filter: "drop-shadow(0 0 24px rgba(59,130,246,0.35))" }}>
          {/* Lens */}
          <circle cx="34" cy="34" r="28" fill="#0f2744" stroke="#3b82f6" strokeWidth="5"/>
          {/* Car body */}
          <rect x="17" y="37" width="34" height="13" rx="3" fill="#60a5fa"/>
          {/* Car roof */}
          <rect x="22" y="27" width="24" height="13" rx="4" fill="#60a5fa"/>
          {/* Wheels */}
          <circle cx="23" cy="51" r="4.5" fill="#0f2744" stroke="#93c5fd" strokeWidth="2.2"/>
          <circle cx="47" cy="51" r="4.5" fill="#0f2744" stroke="#93c5fd" strokeWidth="2.2"/>
          {/* Handle */}
          <line x1="56" y1="56" x2="82" y2="82" stroke="#3b82f6" strokeWidth="7" strokeLinecap="round"/>
          {/* Green badge */}
          <circle cx="58" cy="14" r="15" fill="#10b981"/>
          <polyline points="50,14 56,20 66,9" stroke="white" strokeWidth="3.5" fill="none"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        <h1 className="font-bold text-5xl text-white tracking-tight mb-1">
          Car<span className="text-sage-300">Assist</span>
        </h1>
        <p className="text-muted text-sm tracking-widest uppercase">Buy with Confidence</p>
      </div>

      {/* Welcome statement */}
      <div className="max-w-lg mb-10">
        <h2 className="text-3xl font-bold text-white mb-4 leading-snug">
          Find your perfect used car<br />
          <span className="text-sage-300">powered by AI</span>
        </h2>
        <p className="text-muted text-lg leading-relaxed">
          Search 9+ major marketplaces at once, get AI deal scores on every listing,
          and buy with expert guidance — all in one place.
        </p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-3 justify-center mb-10 text-sm">
        {["🔍 Smart Search", "🤖 AI Deal Scoring", "📚 Buying Guide", "💬 Ask AI"].map(f => (
          <span key={f} className="px-4 py-2 rounded-full border border-sage-300/20 bg-sage-300/5 text-dim">
            {f}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3">
        <Link href="/login" className="btn-primary px-10 py-3 text-base">
          Get Started →
        </Link>
        <p className="text-xs text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-sage-300 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
