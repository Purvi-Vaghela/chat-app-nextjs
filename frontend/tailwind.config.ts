import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Light mode
        light: {
          bg: "#ffffff",
          sidebar: "#f0f2f5",
          chat: "#efeae2",
          bubble: {
            sent: "#d9fdd3",
            received: "#ffffff",
          },
          text: {
            primary: "#111b21",
            secondary: "#667781",
          },
          border: "#e9edef",
          hover: "#f5f6f6",
        },
        // Dark mode
        dark: {
          bg: "#111b21",
          sidebar: "#202c33",
          chat: "#0b141a",
          bubble: {
            sent: "#005c4b",
            received: "#202c33",
          },
          text: {
            primary: "#e9edef",
            secondary: "#8696a0",
          },
          border: "#2a3942",
          hover: "#2a3942",
        },
        // Accent color (same in both modes)
        accent: {
          DEFAULT: "#00a884",
          hover: "#06cf9c",
          light: "#d1f4e8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
