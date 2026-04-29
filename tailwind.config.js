/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // CXX Electronics brand system
        cxx: {
          navy: '#0F1B2D',      // dark header background
          blue: '#0066FF',      // primary accent / CTAs
          'blue-hover': '#0052CC',
          'blue-light': '#E8F0FF', // light accent bg
          bg: '#F8FAFF',        // subtle page section bg
          red: '#EF4444',       // sale / out-of-stock badges
          text: '#111827',      // primary text
          muted: '#6B7280',     // secondary text
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
