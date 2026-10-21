/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bunker: {
          black: '#17191D',
          dark: '#111315',
          graphite: '#282C33',
          warmwhite: '#FAFAF8',
          gray: '#ECEEF1',
          border: '#E2E4E9',
          muted: '#68707D',
          orange: {
            DEFAULT: '#F28C28',
            hover: '#e07d1b',
            light: '#ff9d3b',
            dark: '#c76b12',
            50: '#fff8f0',
            100: '#feeddb',
            500: '#F28C28',
            600: '#d9771e',
          }
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'bunker': '0 4px 20px -2px rgba(23, 25, 29, 0.08)',
        'bunker-lg': '0 10px 30px -5px rgba(23, 25, 29, 0.12)',
        'orange-glow': '0 0 25px -3px rgba(242, 140, 40, 0.35)',
      }
    },
  },
  plugins: [],
}
