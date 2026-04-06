/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Untitled UI inspired neutral palette
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-2xl": ["4.5rem", { lineHeight: "5.625rem", letterSpacing: "-0.02em" }],
        "display-xl": ["3.75rem", { lineHeight: "4.5rem", letterSpacing: "-0.02em" }],
        "display-lg": ["3rem", { lineHeight: "3.75rem", letterSpacing: "-0.02em" }],
        "display-md": ["2.25rem", { lineHeight: "2.75rem", letterSpacing: "-0.02em" }],
        "display-sm": ["1.875rem", { lineHeight: "2.375rem" }],
        "display-xs": ["1.5rem", { lineHeight: "2rem" }],
        "text-xl": ["1.25rem", { lineHeight: "1.875rem" }],
        "text-lg": ["1.125rem", { lineHeight: "1.75rem" }],
        "text-md": ["1rem", { lineHeight: "1.5rem" }],
        "text-sm": ["0.875rem", { lineHeight: "1.25rem" }],
        "text-xs": ["0.75rem", { lineHeight: "1.125rem" }],
      },
      boxShadow: {
        "xs": "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
        "sm": "0px 1px 3px 0px rgba(16, 24, 40, 0.10), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)",
        "md": "0px 4px 8px -2px rgba(16, 24, 40, 0.10), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)",
        "lg": "0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)",
        "xl": "0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
