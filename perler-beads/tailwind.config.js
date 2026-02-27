/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'Noto Sans SC', 'sans-serif'],
      },
      colors: {
        cream: '#FDF8F3',
        'deep-navy': '#1A1A2E',
        'soft-purple': '#4A4A68',
        coral: '#E85D75',
        'mint': '#A8EDEA',
        'peach': '#FECFEF',
      },
    },
  },
  plugins: [],
}
