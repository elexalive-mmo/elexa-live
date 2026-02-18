/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  presets: [require('../../packages/ui/tailwind-preset.cjs')],
  theme: {
    extend: {},
  },
  plugins: [],
};
