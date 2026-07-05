import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        accent: "var(--color-accent)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        border: "var(--color-border)",
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        muted: "var(--color-muted)",

        /*
         * shadcn/ui semantic slots (docs/design-system.md §5). These read the
         * HSL-triplet CSS variables in app/globals.css, which are themselves
         * mapped to the Light brand tokens above — shadcn primitives never
         * introduce their own colors.
         */
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        sans: ["var(--font-alexandria)"],
        tabular: ["var(--font-readex)"],
      },
      fontSize: {
        display: ["2.5rem", { lineHeight: "1.25" }], // 40 / 1.25
        h1: ["1.875rem", { lineHeight: "1.3" }], // 30 / 1.3
        h2: ["1.5rem", { lineHeight: "1.35" }], // 24 / 1.35
        h3: ["1.25rem", { lineHeight: "1.4" }], // 20 / 1.4
        "body-lg": ["1.125rem", { lineHeight: "1.7" }], // 18 / 1.7
        body: ["1rem", { lineHeight: "1.7" }], // 16 / 1.7
        sm: ["0.875rem", { lineHeight: "1.6" }], // 14 / 1.6
        xs: ["0.75rem", { lineHeight: "1.5" }], // 12 / 1.5
      },
      spacing: {
        "0": "0px",
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "6": "24px",
        "8": "32px",
        "12": "48px",
        "16": "64px",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      boxShadow: {
        e1: "0 1px 2px 0 rgb(20 33 61 / 0.06), 0 1px 3px 0 rgb(20 33 61 / 0.08)",
        e2: "0 4px 6px -1px rgb(20 33 61 / 0.08), 0 2px 4px -2px rgb(20 33 61 / 0.06)",
        e3: "0 10px 15px -3px rgb(20 33 61 / 0.1), 0 4px 6px -4px rgb(20 33 61 / 0.08)",
      },
      transitionDuration: {
        fast: "120ms",
        base: "200ms",
        slow: "320ms",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 200ms ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
