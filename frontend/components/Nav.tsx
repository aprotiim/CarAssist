"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/wizard",  label: "Search" },
  { href: "/guide",   label: "Guide"  },
  { href: "/chat",    label: "Ask AI" },
];

export default function Nav() {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  // Don't render nav on login or landing page
  if (pathname === "/login" || pathname === "/landing") return null;

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-sage-300/[0.08] bg-dark-900/80 backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-3 cursor-pointer">
        {/* Cargenuity logo icon */}
        <svg viewBox="0 0 44 44" width="38" height="38" aria-hidden="true">
          {/* Lens */}
          <circle cx="17" cy="17" r="14" fill="#0f2744" stroke="#3b82f6" strokeWidth="2.5"/>
          {/* Car body */}
          <rect x="8.5" y="18.5" width="17" height="6.5" rx="1.5" fill="#60a5fa"/>
          {/* Car roof */}
          <rect x="11" y="13.5" width="12" height="6.5" rx="2" fill="#60a5fa"/>
          {/* Wheels */}
          <circle cx="11.5" cy="25.5" r="2.2" fill="#0f2744" stroke="#93c5fd" strokeWidth="1.2"/>
          <circle cx="23.5" cy="25.5" r="2.2" fill="#0f2744" stroke="#93c5fd" strokeWidth="1.2"/>
          {/* Handle */}
          <line x1="28" y1="28" x2="41" y2="41" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round"/>
          {/* Green badge */}
          <circle cx="29" cy="7" r="7.5" fill="#10b981"/>
          <polyline points="25,7 28,10 33,4.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="flex flex-col leading-none">
          <span className="font-bold text-white text-[18px] tracking-tight">
            Car<span className="text-sage-300">Genuity</span>
          </span>
          <span className="text-[9px] text-muted tracking-widest uppercase">Buy with Confidence</span>
        </div>
      </Link>

      <div className="flex items-center gap-1">
        {links.map(({ href, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                active
                  ? "bg-sage-300/15 text-sage-300"
                  : "text-muted hover:text-dim"
              }`}
            >
              {label}
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="ml-3 px-3.5 py-1.5 rounded-md text-sm font-medium text-muted hover:text-red-400 transition-all"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
