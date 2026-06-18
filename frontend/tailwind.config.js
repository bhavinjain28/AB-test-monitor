/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f', // page background — deep near-black with blue undertone
        surface: '#101015', // card / tile background
        elevated: '#16161d', // hover / raised surface
        border: 'rgba(255,255,255,0.07)', // default hairline border
        borderHi: 'rgba(124,110,242,0.40)', // active / focused border
        accent: '#7c6ef2', // the single brand purple
        accentBright: '#9a8df5', // brighter purple for the live LLR line
        accentDim: 'rgba(124,110,242,0.14)', // accent glow fill
        success: '#34d399', // winner green
        danger: '#f87171', // no-effect red
        warn: '#fbbf24', // demo / provisional amber
        textPri: '#f4f4f8', // primary text
        textSec: '#9094a3', // secondary / body
        textMut: '#6b6b78', // muted / labels
        textFaint: '#4a4a55', // faint / dividers in text
      },
      fontFamily: {
        sans: ['Inter Tight', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        serif: ['Instrument Serif', 'serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(124,110,242,0.10)',
        card: '0 30px 80px -20px rgba(0,0,0,0.6)',
        cta: '0 8px 28px rgba(124,110,242,0.32), inset 0 1px 0 rgba(255,255,255,0.18)',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.7)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.55' },
          '100%': { transform: 'scale(3.6)', opacity: '0' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        drift: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'scroll-x': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-dot': 'pulse-dot 1.8s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.4s ease-out infinite',
        blink: 'blink 2.6s ease-in-out infinite',
        drift: 'drift 8s ease-in-out infinite',
        'scroll-x': 'scroll-x 48s linear infinite',
        'fade-up': 'fade-up 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}
