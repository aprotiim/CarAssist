"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"login" | "register">("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = tab === "login" ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || (tab === "login" ? "Login failed" : "Registration failed"));
        return;
      }

      const from = searchParams.get("from") || "/";
      router.push(from);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function switchTab(t: "login" | "register") {
    setTab(t);
    setError("");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <svg viewBox="0 0 88 88" width="72" height="72" aria-hidden="true" className="mx-auto mb-4"
            style={{ filter: "drop-shadow(0 0 18px rgba(59,130,246,0.35))" }}>
            <circle cx="34" cy="34" r="28" fill="#0f2744" stroke="#3b82f6" strokeWidth="5"/>
            <rect x="17" y="37" width="34" height="13" rx="3" fill="#60a5fa"/>
            <rect x="22" y="27" width="24" height="13" rx="4" fill="#60a5fa"/>
            <circle cx="23" cy="51" r="4.5" fill="#0f2744" stroke="#93c5fd" strokeWidth="2.2"/>
            <circle cx="47" cy="51" r="4.5" fill="#0f2744" stroke="#93c5fd" strokeWidth="2.2"/>
            <line x1="56" y1="56" x2="82" y2="82" stroke="#3b82f6" strokeWidth="7" strokeLinecap="round"/>
            <circle cx="58" cy="14" r="15" fill="#10b981"/>
            <polyline points="50,14 56,20 66,9" stroke="white" strokeWidth="3.5" fill="none"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="font-bold text-2xl text-white tracking-tight">
            Car<span className="text-sage-300">Assist</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            {tab === "login" ? "Sign in to continue" : "Create your account"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl border border-dark-400 p-1 mb-5 bg-dark-900/50">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t
                  ? "bg-sage-300/15 text-sage-300"
                  : "text-muted hover:text-dim"
              }`}
            >
              {t === "login" ? "Sign in" : "Register"}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {tab === "register" && (
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus={tab === "login"}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              {tab === "register" && (
                <p className="text-xs text-muted mt-1">Minimum 6 characters</p>
              )}
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? tab === "login" ? "Signing in..." : "Creating account..."
                : tab === "login" ? "Sign in →" : "Create account →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
