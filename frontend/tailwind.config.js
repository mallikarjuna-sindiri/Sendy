/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mustard: '#FFD700',
      },
      fontFamily: {
        cursive: ['Dancing Script', 'cursive'],
      },
    },
  },
  plugins: [],
}