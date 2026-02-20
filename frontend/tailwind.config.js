/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"DM Sans"', 'sans-serif'],
        display: ['"Syne"', 'sans-serif'],
      },
      colors: {
        bg: '#080c14',
        surface: '#0d1320',
        panel: '#111827',
        border: '#1e2d45',
        accent: '#00d4ff',
        accentDim: '#0099bb',
        muted: '#4a5568',
        text: '#e2e8f0',
        textMuted: '#94a3b8',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      boxShadow: {
        glass: '0 4px 32px rgba(0,212,255,0.06)',
        glow: '0 0 20px rgba(0,212,255,0.15)',
      },
    },
  },
  plugins: [],
}
