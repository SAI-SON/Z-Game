/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#050508',
        'neon-cyan': '#00F5FF',
        'neon-purple': '#BF00FF',
        'neon-pink': '#FF0080',
      },
      backdropBlur: {
        'md': '12px',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 245, 255, 0.5)',
        'glow-purple': '0 0 20px rgba(191, 0, 255, 0.5)',
        'glow-pink': '0 0 20px rgba(255, 0, 128, 0.5)',
      },
      dropShadow: {
        'glow-cyan': '0 0 10px rgba(0, 245, 255, 0.6)',
        'glow-purple': '0 0 10px rgba(191, 0, 255, 0.6)',
        'glow-pink': '0 0 10px rgba(255, 0, 128, 0.6)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(0, 245, 255, 0.8)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 40px rgba(0, 245, 255, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}
