/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // ── Color Palette ──────────────────────────────────────────────────────
      colors: {
        brand: {
          50:  '#FFF5EF',
          100: '#FFE8D6',
          200: '#FFC9A8',
          300: '#FFAA7A',
          400: '#FF8C5A',
          500: '#FF6B35', // primary
          600: '#F04D1A',
          700: '#C63C12',
          800: '#9D2F0E',
          900: '#7A250B',
        },
        cream: '#FFF8F5',
        surface: '#FFFFFF',
      },

      // ── Typography ─────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['"Nunito"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      // ── Border Radius ──────────────────────────────────────────────────────
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // ── Shadows ────────────────────────────────────────────────────────────
      boxShadow: {
        soft:         '0 2px 15px rgba(0, 0, 0, 0.06)',
        card:         '0 4px 24px rgba(0, 0, 0, 0.07)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.13)',
        brand:        '0 4px 20px rgba(255, 107, 53, 0.30)',
        'brand-lg':   '0 8px 30px rgba(255, 107, 53, 0.45)',
      },

      // ── Animations ─────────────────────────────────────────────────────────
      animation: {
        float:   'float 4s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-14px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition:  '1000px 0' },
        },
      },
    },
  },
  plugins: [],
};
