import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefaf4",
          100: "#d7f3e4",
          200: "#b3e8ce",
          300: "#80d6b0",
          400: "#46bd8e",
          500: "#10b981", // Fresh mint green
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22", // Deep forest green
        },
        forest: {
          light: "#1a4d3e",
          DEFAULT: "#0d3829",
          dark: "#08261b",
        },
        mint: {
          light: "#34d399",
          DEFAULT: "#10b981",
          dark: "#059669",
        },
        warm: {
          50: "#FDFDFD",
          100: "#FAF9F6", // Warm off-white
          200: "#F4F3EE",
          300: "#EBEAE3",
          400: "#D8D6CD",
        },
        charcoal: {
          50: "#f6f6f7",
          100: "#e1e2e5",
          200: "#c3c4ca",
          300: "#9ea0aa",
          400: "#757784",
          500: "#595b68",
          600: "#444550",
          700: "#34353d",
          800: "#222328",
          900: "#18181b", // Charcoal primary text
          950: "#0e0e11",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        card: "0 4px 20px -2px rgba(12, 59, 46, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)",
        "card-hover": "0 12px 30px -4px rgba(12, 59, 46, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05)",
        premium: "0 20px 40px -15px rgba(2, 44, 34, 0.15)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
