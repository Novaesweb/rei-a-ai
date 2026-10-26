/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#8b2cff',
          'primary-hover': '#7a22e6',
          'primary-light': '#a855f7',
          secondary: '#ec4899',
          'secondary-hover': '#db2777',
          'secondary-light': '#f472b6',
          dark: '#0a0714',
          'dark-card': '#130d26',
          'dark-border': '#281c52',
          'dark-lighter': '#1d1538',
          accent: '#06b6d4',
          gold: '#f59e0b',
        }
      },
      boxShadow: {
        'neon-primary': '0 0 20px rgba(139, 44, 255, 0.35)',
        'neon-secondary': '0 0 20px rgba(236, 72, 153, 0.35)',
        'neon-gold': '0 0 20px rgba(245, 158, 11, 0.35)',
      }
    },
  },
  plugins: [],
}
