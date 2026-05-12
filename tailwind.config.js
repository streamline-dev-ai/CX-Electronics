/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // CW Electronics — Strict premium palette (Red, Navy, White only)
        cw: {
          dark: '#000000',          // Primary dark background
          red: '#E63939',           // Primary accent red
          'red-hover': '#C82020',   // Red hover state
          text: '#000000',          // Text on light backgrounds
          border: '#E5E7EB',        // Subtle borders and dividers
        },
        // Backwards compatibility aliases
        cxx: {
          navy: '#000000',
          blue: '#E63939',
          'blue-hover': '#C82020',
          'blue-light': '#FEE9E9',
          text: '#000000',
          muted: '#94A3B8',
          bg: '#F8FAFC',
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
