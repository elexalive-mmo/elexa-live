/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        elexa: {
          bg: '#0f0a1e', // Deep Space Violet
          card: '#1a103c', // Panel BG
          primary: '#8b5cf6', // Vivid Violet (Buttons)
          secondary: '#d946ef', // Magenta
          accent: '#fbbf24', // Gold (EXP/Value)
          magic: '#06b6d4', // Cyan (Mana/Tech)
          surface: 'rgba(26, 16, 60, 0.7)', // Glassmorphism
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
        display: ['Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #2e1065 0%, #0f0a1e 100%)',
      }
    },
  },
  plugins: [],
};
