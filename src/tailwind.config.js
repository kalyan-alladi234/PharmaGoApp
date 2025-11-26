/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2D6CDF",
          dark: "#1E4FB8",
          light: "#4D85F7",
        },
        background: "#F9FAFB",
        muted: "#6B7280",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 12px rgba(0,0,0,0.08)",
        soft: "0 2px 6px rgba(0,0,0,0.05)",
        smooth: "0 8px 24px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};
