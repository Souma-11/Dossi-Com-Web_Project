/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0B2A5B',
          blue: '#0B4F9E',
          turquoise: '#1FAFB5',
          tealDark: '#0E7C86',
          bg: '#EEF3F9',
          slate: '#5B6675',
          border: '#D5DEEA',
          tableHead: '#12304F',
        },
        priority: {
          p1: '#C8102E',
          p2: '#B85C00',
          p3: '#0B4F9E',
          p4: '#5B6675',
          free: '#1B7F4B',
          maint: '#3B4A63',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        display: ['Oswald', 'sans-serif'],
      },
      borderRadius: {
        card: '8px',
      },
    },
  },
  plugins: [],
};