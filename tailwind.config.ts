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
        primary: "#2563eb",
        "primary-hover": "#1d4ed8",
        secondary: "#f8fafc",
        admin: {
          bg: "#0c0f14",
          card: "#151922",
          border: "#252a35",
          "border-light": "#2d3340",
          muted: "#64748b",
          accent: "#06b6d4",
          "accent-hover": "#22d3ee",
          "accent-glow": "rgba(6, 182, 212, 0.15)",
        },
      },
      boxShadow: {
        "admin-card": "0 4px 24px -4px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
        "admin-glow": "0 0 40px -8px rgba(6, 182, 212, 0.25)",
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
      minHeight: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};
export default config;
