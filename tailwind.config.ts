import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", md: "2rem" },
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        ink: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          500: "#64748b",
          700: "#334155",
          900: "#0f172a",
          950: "#020617",
        },
        gold: {
          400: "#facc15",
          500: "#eab308",
          600: "#ca8a04",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Segoe UI", "Inter", "Roboto", "Helvetica Neue", "Arial"],
        display: ["ui-sans-serif", "Inter", "Segoe UI", "system-ui"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15,23,42,0.04), 0 4px 16px -4px rgba(15,23,42,0.08)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse at top, rgba(249,115,22,0.10), transparent 60%), radial-gradient(ellipse at bottom right, rgba(234,179,8,0.10), transparent 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
