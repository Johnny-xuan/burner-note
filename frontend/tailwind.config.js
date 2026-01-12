/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burn: {
          50: '#fef3f2',
          100: '#fee4e2',
          200: '#fececa',
          300: '#fcaba4',
          400: '#f87a6f',
          500: '#ef5343',
          600: '#dc3626',
          700: '#b92b1c',
          800: '#99271b',
          900: '#7f261d',
        }
      }
    },
  },
  plugins: [],
}
