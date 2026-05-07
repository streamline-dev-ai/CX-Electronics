/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // CW Electronics brand system — Red & Slate Dark
        cw: {
          dark: '#0F172A',          // primary dark background (softer than pure black)
          'dark-alt': '#1E293B',    // alternate dark sections
          red: '#E63939',           // primary red accent / CTAs
          'red-hover': '#C82020',   // red hover
          'red-light': '#FEE9E9',   // light red tint bg
          bg: '#F9FAFB',            // subtle page section bg
          text: '#111827',          // primary text
          muted: '#6B7280',         // secondary text
        },
        // Keep old cxx aliases for backwards compat
        cxx: {
          navy: '#0F172A',
          blue: '#E63939',
          'blue-hover': '#C82020',
          'blue-light': '#FEE9E9',
          bg: '#F9FAFB',
          red: '#E63939',
          text: '#111827',
          muted: '#6B7280',
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
