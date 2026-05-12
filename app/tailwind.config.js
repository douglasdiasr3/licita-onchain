/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0A1628",
        teal: {
          DEFAULT: "#00C9A7",
          dark: "#009E84",
        },
      },
    },
  },
  plugins: [],
};
