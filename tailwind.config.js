/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: "#F3F2F2",
        night2: "#EAE9E9",
        night3: "#DCD8D7",
        marigold: "#C28D41",
        vermillion: "#A8362A",
        cream: "#201F1D",
        muted: "#6B6764",
        emerald: "#3F7A5C",
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        body: ["'Lora'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
