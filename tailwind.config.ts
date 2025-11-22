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
        // Universidad Panamericana institutional colors
        dorado: {
          DEFAULT: "#B9975B",
          light: "#D4B87A",
          dark: "#9A7A3F",
          50: "#F5F0E6",
          100: "#E8DDC8",
          200: "#D4B87A",
          300: "#C5A563",
          400: "#B9975B",
          500: "#9A7A3F",
          600: "#7A5F2F",
          700: "#5A4522",
          800: "#3A2E16",
          900: "#1A1709",
        },
        azul: {
          DEFAULT: "#002D72",
          light: "#1A4A8C",
          dark: "#001F4F",
          50: "#E6EDF5",
          100: "#B3C9E0",
          200: "#80A5CB",
          300: "#4D81B6",
          400: "#1A5DA1",
          500: "#002D72",
          600: "#00235A",
          700: "#001942",
          800: "#000F2A",
          900: "#000512",
        },
        vino: {
          DEFAULT: "#7a1a37",
          light: "#9D2A4A",
          dark: "#5C1329",
          50: "#F5E6EB",
          100: "#E0B3C4",
          200: "#CB809D",
          300: "#B64D76",
          400: "#A11A4F",
          500: "#7a1a37",
          600: "#5C1329",
          700: "#3E0D1B",
          800: "#20060D",
          900: "#0A0205",
        },
        verde: {
          DEFAULT: "#215347",
          light: "#2D6B5C",
          dark: "#183B32",
          50: "#E6F0ED",
          100: "#B3D4C8",
          200: "#80B8A3",
          300: "#4D9C7E",
          400: "#1A8059",
          500: "#215347",
          600: "#193F36",
          700: "#112B25",
          800: "#081714",
          900: "#030705",
        },
        // Semantic color mappings
        primary: {
          DEFAULT: "#B9975B", // dorado
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#002D72", // azul
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#7a1a37", // vino
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#215347", // verde
          foreground: "#ffffff",
        },
        background: "hsl(0, 0%, 100%)",
        foreground: "hsl(222.2, 84%, 4.9%)",
        card: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(222.2, 84%, 4.9%)",
        },
        popover: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(222.2, 84%, 4.9%)",
        },
        muted: {
          DEFAULT: "hsl(210, 40%, 96.1%)",
          foreground: "hsl(215.4, 16.3%, 46.9%)",
        },
        border: "hsl(214.3, 31.8%, 91.4%)",
        input: "hsl(214.3, 31.8%, 91.4%)",
        ring: "hsl(222.2, 84%, 4.9%)",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5", letterSpacing: "0.01em" }],
        sm: ["0.875rem", { lineHeight: "1.5", letterSpacing: "0.01em" }],
        base: ["1rem", { lineHeight: "1.6", letterSpacing: "0.01em" }],
        lg: ["1.125rem", { lineHeight: "1.6", letterSpacing: "0em" }],
        xl: ["1.25rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        "2xl": ["1.5rem", { lineHeight: "1.4", letterSpacing: "-0.02em" }],
        "3xl": ["1.875rem", { lineHeight: "1.3", letterSpacing: "-0.02em" }],
        "4xl": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.03em" }],
        "5xl": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.04em" }],
        "6xl": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.05em" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      boxShadow: {
        "soft": "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        "premium": "0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;

