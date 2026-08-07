import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f9f9fa",
        surface: "#f9f9fa",
        "surface-bright": "#ffffff",
        "surface-container": "#eeeeef",
        "surface-container-high": "#e8e8e9",
        "surface-variant": "#e2e2e3",
        "on-background": "#1a1c1d",
        "on-surface": "#1a1c1d",
        "on-surface-variant": "#434655",
        primary: "#004ac6",
        "primary-container": "#2563eb",
        "on-primary": "#ffffff",
        "outline-variant": "#c3c6d7",
        emerald: {
          500: "#10b981",
          400: "#34d399",
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["Geist", "JetBrains Mono", "monospace"],
      },
      maxWidth: {
        "container-max": "1280px",
      },
    },
  },
  plugins: [],
};
export default config;
