/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A1A",
        primary: "#5A32FA",
        secondary: "#FFB020",
        surface: "#1C1C2A",
        surfaceHover: "#2A2A3D",
        textPrimary: "#F0F0F0",
        textSecondary: "#A0A0B0"
      }
    },
  },
  plugins: [],
}
