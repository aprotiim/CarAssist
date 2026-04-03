import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50:  "#f0fdf9",
          100: "#ccfbef",
          200: "#99f6df",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
        },
        dark: {
          900: "#0a0a1a",
          800: "#0d1117",
          700: "#111827",
          600: "#141428",
          500: "#1a1a2e",
          400: "#2a2a4a",
          300: "#3a3a5a",
        },
        muted: "#8888aa",
        dim:   "#c8c8d8",
      },
      fontFamily: {
        sans:  ["DM Sans", "sans-serif"],
        mono:  ["Space Mono", "monospace"],
      },
      backgroundImage: {
        "app-gradient":
          "linear-gradient(170deg, #0a0a1a 0%, #0d1117 40%, #0a0a1a 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(20,20,40,0.9), rgba(15,15,30,0.95))",
        "btn-gradient":
          "linear-gradient(135deg, #059669, #10b981)",
      },
      boxShadow: {
        sage: "0 4px 20px rgba(16,185,129,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
