/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // CW Electronics — Strict premium palette (Red, Navy, White only)
        cw: {
          dark: '#0F172A',          // Primary dark background
          red: '#E63939',           // Primary accent red
          'red-hover': '#C82020',   // Red hover state
          text: '#0F172A',          // Text on light backgrounds
          border: '#E5E7EB',        // Subtle borders and dividers
        },
        // Backwards compatibility aliases
        cxx: {
          navy: '#0F172A',
          blue: '#E63939',
          'blue-hover': '#C82020',
          text: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      aspectRatio: {
        product: '1 / 1',
      },
    },
  },
  plugins: [],
}
