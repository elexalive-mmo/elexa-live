/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,jsx,ts,tsx}'
    ],
    theme: {
        extend: {
            colors: {
                'obsidian': '#020205',
                'obsidian-glass': 'rgba(5, 5, 10, 0.9)',
                'crystal-cyan': '#00f2ff',
                'aetheric-purple': '#a855f7',
                'celestial-gold': '#facc15',
                'mana-blue': '#3b82f6',
            },
            fontFamily: {
                'heading': ['Cinzel', 'serif'],
                'body': ['Cormorant Garamond', 'serif'],
            },
            backdropBlur: {
                'xs': '2px',
            }
        },
    },
    plugins: [],
};
