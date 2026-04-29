/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // CXX Electronics brand system — Red & Black
        cxx: {
          navy: '#111827',          // primary dark / navbar
          blue: '#E63939',          // primary red accent / CTAs
          'blue-hover': '#C82020',  // red hover
          'blue-light': '#FEE9E9',  // light red tint bg
          bg: '#F9FAFB',            // subtle page section bg
          red: '#E63939',           // sale / badges
          text: '#111827',          // primary text
          muted: '#6B7280',         // secondary text
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
