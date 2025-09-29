/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'werewolf': {
          'dark': '#1a0e1a',
          'blood': '#8b0000',
          'moon': '#f5f5dc',
          'forest': '#2d4a2d',
          'shadow': '#4a4a4a'
        }
      },
      fontFamily: {
        'medieval': ['Cinzel', 'serif'],
      },
      backgroundImage: {
        'werewolf-bg': "linear-gradient(135deg, #1a0e1a 0%, #2d4a2d 50%, #1a0e1a 100%)",
        'moon-glow': "radial-gradient(circle, rgba(245,245,220,0.3) 0%, transparent 70%)"
      }
    },
  },
  plugins: [],
}
