import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { PreferencesProvider } from "@/lib/preferences-context";

export const metadata: Metadata = {
  title: "CarAssist — AI-Powered Used Car Buying Assistant",
  description:
    "Buy your next used car with confidence. AI-powered search across every major marketplace with expert buying guidance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Ambient glow orbs */}
        <div
          className="fixed pointer-events-none"
          style={{
            top: -200, right: -200, width: 500, height: 500,
            background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="fixed pointer-events-none"
          style={{
            bottom: -300, left: -200, width: 600, height: 600,
            background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)",
          }}
        />

        <PreferencesProvider>
          <Nav />
          <main className="max-w-[860px] mx-auto px-5 py-6 pb-16">
            {children}
          </main>
        </PreferencesProvider>
      </body>
    </html>
  );
}
