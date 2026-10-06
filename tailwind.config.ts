import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        noubla: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        cardPastel: {
          purple: "#EDE9FE",
          sky: "#E0F2FE",
          mint: "#DCFCE7",
          peach: "#FFEDD5",
          rose: "#FFE4E6",
          amber: "#FEF3C7",
        }
      },
      borderRadius: {
        "3xl": "24px",
        "4xl": "32px",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0, 0, 0, 0.04)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
        float: "0 20px 40px -15px rgba(0, 0, 0, 0.1)",
      },
      fontFamily: {
        sans: ["var(--font-ibm-plex-arabic)", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
