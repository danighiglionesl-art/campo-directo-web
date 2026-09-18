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
        campo: {
          green: {
            DEFAULT: "#339966",
            50: "#f0f8f3",
            100: "#dcf0e3",
            200: "#bae1c9",
            300: "#8fcbaa",
            400: "#5eb587",
            500: "#339966", // Brand green
            600: "#277d52",
            700: "#206342",
            800: "#1b4f36",
            900: "#17412d",
            950: "#0b2419",
          },
          yellow: {
            DEFAULT: "#F0B922", // Brand leaf primary
            light: "#f7d264",
            dark: "#d49d10",
          },
          gold: {
            DEFAULT: "#E58817", // Brand leaf shadow
            light: "#fa9f34",
            dark: "#b8680c",
          },
        },
      },
      boxShadow: {
        card: "0 8px 30px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 14px 35px rgba(0, 0, 0, 0.11)",
      },
    },
  },
  plugins: [],
};
export default config;
