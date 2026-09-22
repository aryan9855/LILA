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
        game: {
          bg: '#0a0d14',
          panel: '#111724',
          card: '#161f33',
          border: '#212d47',
          accent: '#3b82f6',
          human: '#10b981', // Emerald green
          bot: '#f59e0b',   // Amber orange
          kill: '#ef4444',  // Crimson red
          death: '#f43f5e', // Rose
          storm: '#a855f7', // Purple
          loot: '#06b6d4'   // Cyan
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
