import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* Neo-Brutalist Color System */
      colors: {
        // Monochrome Base
        brutal: {
          black: "hsl(var(--color-black))",
          white: "hsl(var(--color-white))",
          gray: {
            50: "hsl(var(--color-gray-50))",
            100: "hsl(var(--color-gray-100))",
            200: "hsl(var(--color-gray-200))",
            300: "hsl(var(--color-gray-300))",
            800: "hsl(var(--color-gray-800))",
            900: "hsl(var(--color-gray-900))",
          },
        },
        // Data Visualization Accents
        viz: {
          blue: "hsl(var(--color-viz-blue))",
          pink: "hsl(var(--color-viz-pink))",
          green: "hsl(var(--color-viz-green))",
          orange: "hsl(var(--color-viz-orange))",
          yellow: "hsl(var(--color-viz-yellow))",
        },
        // Legacy compatibility
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        border: "hsl(var(--border))",
      },

      /* Typography */
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
        mono: "var(--font-mono)",
      },

      /* Border Widths */
      borderWidth: {
        brutal: "var(--border-width)",
        "brutal-thick": "var(--border-width-thick)",
      },

      /* Border Radius - Minimal for Neo-Brutalist */
      borderRadius: {
        none: "var(--border-radius-none)",
        brutal: "var(--border-radius-sm)",
      },

      /* Shadows - Neo-Brutalist */
      boxShadow: {
        brutal: "var(--shadow-brutal)",
        "brutal-sm": "var(--shadow-brutal-sm)",
        "brutal-lg": "var(--shadow-brutal-lg)",
        "brutal-hover": "var(--shadow-brutal-hover)",
      },

      /* Animations */
      keyframes: {
        "slide-in-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "number-pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "slide-in-up": "slide-in-up 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-in-left": "slide-in-left 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        "scale-in": "scale-in 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        "number-pop": "number-pop 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
