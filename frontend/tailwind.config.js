/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#09090B', // page background — near black with blue undertone
        surface: '#111117', // card background
        elevated: '#18181F', // hover / active card state
        border: 'rgba(255,255,255,0.07)', // default border
        borderHi: 'rgba(99,102,241,0.35)', // active / focused border
        accent: '#6366F1', // indigo — the single brand colour
        accentDim: 'rgba(99,102,241,0.15)', // accent glow fill
        success: '#10B981', // winner green
        danger: '#EF4444', // no-effect red
        textPri: '#F4F4F5', // primary text
        textSec: '#A1A1AA', // secondary / labels
        textMut: '#52525B', // muted / disabled
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(99,102,241,0.08)',
      },
    },
  },
  plugins: [],
}
