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

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-sage-300/[0.08] bg-dark-900/80 backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-2 cursor-pointer">
        <span className="text-xl" style={{ filter: "drop-shadow(0 0 6px rgba(16,185,129,0.4))" }}>
          🔮
        </span>
        <span className="font-mono font-bold text-sage-300 text-[17px] tracking-tight">
          CarAssist
        </span>
      </Link>

      <div className="flex gap-1">
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
      </div>
    </nav>
  );
}
