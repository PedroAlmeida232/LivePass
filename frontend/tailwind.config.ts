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
        bg: "#0A0A0B",
        surface: "#111113",
        "surface-2": "#1A1A1E",
        border: "#2A2A30",
        primary: "#6C8EBF",
        "primary-light": "#9AB4D8",
        "primary-dim": "#3D5A80",
        success: "#2ECC71",
        error: "#E74C3C",
        warning: "#F39C12",
        pending: "#3498DB",
        "text-primary": "#E8ECF0",
        "text-secondary": "#8A8490",
        "text-muted": "#4A4750",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "serif"],
        body: ['"DM Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      fontSize: {
        "display-xl": ["64px", { lineHeight: "1.1", fontWeight: "300" }],
        "display-lg": ["48px", { lineHeight: "1.15", fontWeight: "400" }],
        "display-md": ["32px", { lineHeight: "1.2", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 50%, 90%": { transform: "translateX(-6px)" },
          "30%, 70%": { transform: "translateX(6px)" },
          "40%, 60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        shake: "shake 300ms ease-in-out",
        "spin-slow": "spin-slow 2s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
