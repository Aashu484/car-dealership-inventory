/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui"],
      },
      colors: {
        ink: "#0f172a",
        copper: "#c45c26",
      },
    },
  },
  plugins: [],
};
