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
        // Ivory Theme (Light Mode)
        ivory: {
          bg: "#FFF8F0",
          text: "#2C2416",
          card: "#FFFFFF",
          secondary: "#F5E6D3",
          muted: "#F0E4D7",
          border: "#E8D8C4",
        },
        terracotta: {
          DEFAULT: "#E07855",
          dark: "#D96941",
          light: "#F09F7D",
        },
        // Dark Theme
        charcoal: {
          DEFAULT: "#1A1A1A",
          light: "#242424",
          medium: "#2D2D2D",
          border: "#3A3A3A",
        },
        orange: {
          warm: "#FF8A3D",
          deep: "#FF7626",
        },
        // Semantic colors
        success: {
          DEFAULT: "#10B981",
          bg: "#D1FAE5",
          "bg-dark": "#064E3B",
        },
        warning: {
          DEFAULT: "#F59E0B",
          bg: "#FEF3C7",
          "bg-dark": "#78350F",
        },
        error: {
          DEFAULT: "#EF4444",
          bg: "#FEE2E2",
          "bg-dark": "#7F1D1D",
        },
        info: {
          DEFAULT: "#3B82F6",
          bg: "#DBEAFE",
          "bg-dark": "#1E3A8A",
        },
        // CSS Variables (for theme switching)
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
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        sarabun: ["var(--font-sarabun)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        body: ["var(--font-sarabun)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Display
        display: ["48px", { lineHeight: "1.1", fontWeight: "700" }],
        // Headings
        h1: ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        h2: ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        h3: ["20px", { lineHeight: "1.4", fontWeight: "600" }],
        h4: ["18px", { lineHeight: "1.4", fontWeight: "600" }],
        // Body
        lg: ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        base: ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        sm: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        xs: ["12px", { lineHeight: "1.4", fontWeight: "400" }],
        // Buttons
        "button-lg": ["18px", { lineHeight: "1.2", fontWeight: "600" }],
        button: ["16px", { lineHeight: "1.2", fontWeight: "600" }],
        "button-sm": ["14px", { lineHeight: "1.2", fontWeight: "600" }],
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
      },
      boxShadow: {
        // Minimal shadows (flat design preference)
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        // No medium/large shadows - use borders instead
      },
      keyframes: {
        // Fade animations
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        // Slide animations
        slideInFromBottom: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInFromRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInFromTop: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        // Special effects
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        glowBorder: {
          "0%, 100%": {
            borderColor: "hsl(var(--primary))",
            boxShadow: "0 0 0 0 hsla(var(--primary), 0.4)",
          },
          "50%": {
            borderColor: "hsl(var(--accent))",
            boxShadow: "0 0 20px 8px hsla(var(--primary), 0.4)",
          },
        },
        glowSuccess: {
          "0%, 100%": {
            boxShadow: "0 0 0 0 rgba(16, 185, 129, 0.4)",
          },
          "50%": {
            boxShadow: "0 0 20px 8px rgba(16, 185, 129, 0.4)",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        bounce: {
          "0%, 100%": {
            transform: "translateY(-5%)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 250ms ease-out",
        "fade-out": "fadeOut 200ms ease-in",
        "slide-in-bottom": "slideInFromBottom 250ms ease-out",
        "slide-in-right": "slideInFromRight 300ms ease-out",
        "slide-in-top": "slideInFromTop 250ms ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-slow": "pulseSlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-border": "glowBorder 1s ease-in-out 3",
        "glow-success": "glowSuccess 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite linear",
        bounce: "bounce 1s infinite",
        "spin-slow": "spin 3s linear infinite",
        shake: "shake 0.5s ease-in-out",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
