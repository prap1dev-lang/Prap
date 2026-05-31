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
        // Forest Green primary palette — Nature / Sustainable Housing
        brand: {
          50:  "#f1f6f3",
          100: "#dde9e0",
          200: "#bcd3c2",
          300: "#95b89e",
          400: "#A3B18A", // Sage Green (specified)
          500: "#588157",
          600: "#1B4332", // Forest Green (specified) — primary CTAs
          700: "#132f24",
          800: "#0d2018",
          900: "#06120e",
        },
        // Sage palette (replaces gold for accents — earthy & natural)
        sage: {
          100: "#eaf0e2",
          200: "#d4e0c6",
          300: "#bccfa5",
          400: "#A3B18A", // primary sage
          500: "#7f9269",
          600: "#5e7252",
        },
        // Backwards-compat alias so existing "gold-*" classes still render
        gold: {
          400: "#c4d3a8",
          500: "#A3B18A",
          600: "#7a8b6a",
        },
        beige:    "#F5F5DC",
        offwhite: "#FAFAF8",
        // Ink (neutral text/borders) — slightly warmed for nature theme
        ink: {
          50:  "#f6f6f1",
          100: "#ecece4",
          200: "#d8d8cc",
          500: "#6b6f63",
          700: "#3a3f36",
          900: "#1a1f18",
          950: "#0e1310",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Segoe UI", "Inter", "Roboto", "Helvetica Neue", "Arial"],
        display: ["ui-sans-serif", "Inter", "Segoe UI", "system-ui"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(27,67,50,0.04), 0 4px 16px -4px rgba(27,67,50,0.10)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse at top, rgba(27,67,50,0.10), transparent 60%), radial-gradient(ellipse at bottom right, rgba(163,177,138,0.18), transparent 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
