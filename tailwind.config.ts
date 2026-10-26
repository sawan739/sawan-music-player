import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#05060b', 900: '#090b14', 850: '#0d1020', 800: '#131729', 700: '#1c2137', 600: '#282e4a', 500: '#3a4166' },
        rain: { 200: '#b5fbf0', 300: '#7ff5e3', 400: '#3ee8d0', 500: '#16cdb5', 600: '#0ea597' },
        dusk: { 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed' },
        blush: { 400: '#f472b6', 500: '#ec4899' },
        mist: '#eef1fb',
        muted: '#a3abc4',
        faint: '#727a98',
        accent: 'rgb(var(--accent) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-body)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 22px 45px -22px rgba(0,0,0,.85)',
        glow: '0 0 0 1px rgb(var(--accent) / .25), 0 12px 40px -10px rgb(var(--accent) / .55)',
        'glow-rain': '0 10px 40px -8px rgba(62,232,208,.55)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #3ee8d0 0%, #8b5cf6 55%, #ec4899 100%)',
      },
      keyframes: {
        eq: { '0%,100%': { transform: 'scaleY(.25)' }, '50%': { transform: 'scaleY(1)' } },
        drift: {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '33%': { transform: 'translate3d(6%,-4%,0) scale(1.08)' },
          '66%': { transform: 'translate3d(-5%,5%,0) scale(.95)' },
        },
        marquee: { '0%,15%': { transform: 'translateX(0)' }, '85%,100%': { transform: 'translateX(var(--marquee-distance))' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
        drop: { '0%': { transform: 'translateY(-10%)', opacity: '0' }, '20%': { opacity: '1' }, '100%': { transform: 'translateY(110%)', opacity: '0' } },
        'pulse-ring': { '0%': { transform: 'scale(.95)', opacity: '.6' }, '100%': { transform: 'scale(1.25)', opacity: '0' } },
      },
      animation: {
        eq: 'eq 1s ease-in-out infinite',
        drift: 'drift 22s ease-in-out infinite',
        marquee: 'marquee 9s ease-in-out infinite alternate',
        shimmer: 'shimmer 1.6s infinite',
        'spin-slow': 'spin-slow 6s linear infinite',
        drop: 'drop 1.6s linear infinite',
        'pulse-ring': 'pulse-ring 2.2s ease-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
