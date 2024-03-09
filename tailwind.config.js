/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        pulse: {
          '0%, 100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(0, 255, 0, 0.7)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 10px rgba(0, 255, 0, 0)' },
        },
      },
      animation: {
        'pulse-green': 'pulse 2s infinite',
      },
    },
  },
  plugins: [require("daisyui")],
}