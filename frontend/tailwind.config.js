/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ec4899', // Pink 500
        secondary: '#fce7f3', // Pink 100
        accent: '#be185d', // Pink 700
        background: '#fff1f2', // Rose 50
      },
    },
  },
  plugins: [],
}
