/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: "#2B1210",
        night2: "#3D1B16",
        night3: "#341712",
        marigold: "#F2A93B",
        vermillion: "#D8483B",
        cream: "#F7F1E6",
        muted: "#D8B79C",
        emerald: "#4C8C6B",
      },
      fontFamily: {
        display: ["'Rozha One'", "serif"],
        body: ["'Mukta'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
