/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#fdf8f2',
          100: '#f2e8d5',
          200: '#e5d0b5',
          300: '#d4b892',
          400: '#c2a06e',
          500: '#a67c42',
          600: '#8b5e2e',
          700: '#6e441f',
          800: '#4f2f12',
          900: '#2e1a08',
        }
      }
    },
  },
  plugins: [],
}