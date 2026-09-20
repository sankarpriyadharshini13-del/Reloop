/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand: green-500 (#22c55e) -> green-600 (#16a34a) come from Tailwind's default palette.
        ink: {
          DEFAULT: '#0f172a',
          deep: '#0a1120',
          soft: '#162036',
        },
        mint: {
          50: '#f3fdf6',
          100: '#e3f9ea',
        },
      },
      fontFamily: {
        sans: ['"DM Sans Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque Variable"', '"DM Sans Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 10px 50px -8px rgba(34, 197, 94, 0.55)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scan: {
          '0%': { top: '4%', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { top: '94%', opacity: '0' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.6)' },
          '60%': { opacity: '1', transform: 'translateY(-4px) scale(1.15)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        reveal: {
          '0%, 45%': { opacity: '0', transform: 'translateY(10px)' },
          '55%, 92%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(0)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(24px, -18px) scale(1.08)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        float: 'float 6s ease-in-out infinite',
        scan: 'scan 3.2s ease-in-out infinite',
        pop: 'pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        reveal: 'reveal 6.4s ease-in-out infinite',
        blob: 'blob 14s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
