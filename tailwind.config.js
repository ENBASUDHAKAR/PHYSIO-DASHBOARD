/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#0a0f1e',
        surface: '#111827',
        elevated: '#1a2235',
        border: '#1e293b',
        'accent-teal': '#0ea5e9',
        'accent-mint': '#10b981',
        'accent-amber': '#f59e0b',
        'accent-rose': '#f43f5e',
        'text-primary': '#f1f5f9',
        'text-muted': '#64748b',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(14, 165, 233, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}
