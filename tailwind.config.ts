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
        ivory:    "#FBFAF7",
        paper:    "#F6F5F1",
        // Ink (neutral text/borders) — slightly warmed for nature theme
        ink: {
          50:  "#f6f6f1",
          100: "#ecece4",
          200: "#d8d8cc",
          300: "#b9bbae",
          400: "#8e9184",
          500: "#6b6f63",
          600: "#52564b",
          700: "#3a3f36",
          800: "#262a22",
          900: "#1a1f18",
          950: "#0e1310",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "Segoe UI", "Inter", "Arial"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "Cambria", "serif"],
        display: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
      borderRadius: {
        "2xl": "1.25rem", // 20px
        "3xl": "1.5rem",  // 24px
        "4xl": "2rem",    // 32px
      },
      boxShadow: {
        // Incredibly soft, blurry drop shadows — no hard edges
        card: "0 2px 8px -2px rgba(27,67,50,0.05), 0 12px 32px -12px rgba(27,67,50,0.10)",
        soft: "0 8px 40px -12px rgba(27,67,50,0.12)",
        glow: "0 0 0 1px rgba(255,255,255,0.5) inset, 0 20px 60px -20px rgba(27,67,50,0.20)",
        "inner-glow": "inset 0 1px 0 0 rgba(255,255,255,0.6)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse at top, rgba(27,67,50,0.08), transparent 60%), radial-gradient(ellipse at bottom right, rgba(163,177,138,0.16), transparent 60%)",
        "mesh":
          "radial-gradient(at 18% 22%, rgba(88,129,87,0.28) 0px, transparent 50%), radial-gradient(at 82% 18%, rgba(163,177,138,0.30) 0px, transparent 50%), radial-gradient(at 28% 82%, rgba(27,67,50,0.22) 0px, transparent 50%), radial-gradient(at 75% 78%, rgba(196,211,168,0.30) 0px, transparent 50%)",
      },
      keyframes: {
        meshShift: {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "33%": { transform: "translate3d(2%,-2%,0) scale(1.05)" },
          "66%": { transform: "translate3d(-2%,1%,0) scale(1.02)" },
        },
        floatY: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        revealUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        mesh: "meshShift 22s ease-in-out infinite",
        floaty: "floatY 6s ease-in-out infinite",
        reveal: "revealUp 0.7s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
