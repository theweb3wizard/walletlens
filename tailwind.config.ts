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
        void: "#07070F",
        surface: "#0D0D1A",
        card: "#11111F",
        border: "#1C1C35",
        indigo: {
          DEFAULT: "#6366F1",
          dim: "#4F46E5",
          glow: "#818CF8",
        },
        cyan: {
          DEFAULT: "#06B6D4",
          glow: "#67E8F9",
        },
        emerald: {
          DEFAULT: "#10B981",
          glow: "#34D399",
        },
        rose: {
          DEFAULT: "#F43F5E",
          glow: "#FB7185",
        },
        amber: {
          DEFAULT: "#F59E0B",
          glow: "#FCD34D",
        },
        muted: "#4B5380",
        subtle: "#2A2A4A",
      },
      fontFamily: {
  display: ["var(--font-syne)", "sans-serif"],
  body: ["var(--font-dm-sans)", "sans-serif"],
  mono: ["var(--font-jetbrains)", "monospace"],
},
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)",
        "glow-indigo":
          "radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)",
        "glow-cyan":
          "radial-gradient(ellipse at center, rgba(6,182,212,0.12) 0%, transparent 70%)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        float: "float 6s ease-in-out infinite",
        scan: "scan 2s ease-in-out infinite",
        "fade-up": "fadeUp 0.6s ease forwards",
        typewriter: "typewriter 0.05s steps(1) forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        scan: {
          "0%, 100%": { opacity: "0.4", transform: "scaleX(1)" },
          "50%": { opacity: "1", transform: "scaleX(1.02)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        "glow-indigo": "0 0 30px rgba(99,102,241,0.3)",
        "glow-cyan": "0 0 30px rgba(6,182,212,0.3)",
        "glow-sm": "0 0 15px rgba(99,102,241,0.2)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;