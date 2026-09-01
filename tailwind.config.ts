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
        paper: {
          25: "#FFFEFC",
          50: "#FAF7F2",
          100: "#F5EFEB",
          150: "#EFE6DE",
          200: "#E8DCD1",
          300: "#D6C3B2",
          400: "#C2A892",
          500: "#AC8C73",
        },
        ink: {
          950: "#181411",
          900: "#27211C",
          800: "#3B332C",
          700: "#544940",
          600: "#706357",
          500: "#8E7F71",
          400: "#AEA093",
          300: "#CFC5BC",
          200: "#E4DED8",
          100: "#F2EFEB",
        },
        crimson: {
          950: "#450811",
          900: "#5D0F1B",
          800: "#7F1827",
          700: "#A02135",
          600: "#C42D45",
          500: "#DF3F59",
          400: "#E9697E",
          200: "#F6BAC3",
          100: "#FCE7EB",
          50: "#FDF5F6",
        },
        sepia: {
          50: "#FAF6EE",
          100: "#F3ECD9",
          200: "#E6D7B4",
          300: "#D5C08D",
          400: "#C3A667",
        }
      },
      fontFamily: {
        serif: ["var(--font-serif-bengali)", "Noto Serif Bengali", "serif"],
        sans: ["var(--font-sans-bengali)", "Hind Siliguri", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'paper-sm': '0 1px 3px rgba(39, 33, 28, 0.04), 0 1px 2px rgba(39, 33, 28, 0.06)',
        'paper': '0 4px 12px rgba(39, 33, 28, 0.05), 0 1px 3px rgba(39, 33, 28, 0.08)',
        'paper-lg': '0 10px 25px -5px rgba(39, 33, 28, 0.08), 0 8px 10px -6px rgba(39, 33, 28, 0.04)',
        'paper-float': '0 20px 35px -10px rgba(39, 33, 28, 0.12), 0 1px 3px rgba(39, 33, 28, 0.05)',
        'wax': '0 2px 8px rgba(127, 24, 39, 0.35)',
      },
      backgroundImage: {
        'ruled-paper': 'repeating-linear-gradient(transparent, transparent 31px, rgba(84, 73, 64, 0.08) 31px, rgba(84, 73, 64, 0.08) 32px)',
      },
    },
  },
  plugins: [],
};

export default config;
