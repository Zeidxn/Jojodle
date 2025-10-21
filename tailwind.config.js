/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jojo: {
          pink: '#e137b0',
          'pink-light': '#ff4dd2',
          purple: '#562850',
          'purple-dark': '#710852',
          'purple-darker': '#5e0442',
        }
      },
      boxShadow: {
        'jojo': '0 0 20px rgba(225, 55, 176, 0.6)',
        'jojo-lg': '0 0 30px rgba(255, 77, 210, 0.9)',
      }
    },
  },
  plugins: [],
}
