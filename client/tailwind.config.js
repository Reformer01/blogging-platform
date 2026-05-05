/** @type {import('tailwindcss').Config} */

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        noir: {
          950: '#050505',
          900: '#0a0a0a',
          800: '#111111',
          700: '#181818',
          600: '#222222',
          500: '#2e2e2e',
          400: '#444444',
          300: '#666666',
        },
        slate: {
          950: '#050505',
          900: '#0a0a0a',
          800: '#111111',
          700: '#181818',
          600: '#222222',
          500: '#2e2e2e',
          400: '#444444',
          300: '#666666',
        },
        cream: {
          DEFAULT: '#ede8e0',
          dim: '#c4bfb5',
        },
        warm: {
          gray: '#918a82',
          muted: '#5c5650',
        },
        gold: {
          light: '#d4b87a',
          DEFAULT: '#c9a96e',
          dark: '#a88c55',
        },
        // Keep old accent keys so existing components don't break
        accent: {
          light: '#d4b87a',
          base: '#c9a96e',
          dark: '#a88c55',
        },
        semantic: {
          success: '#6ec991',
          error: '#d4614e',
          warning: '#d4a84e',
        },
      },
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        // Keep old keys for compatibility
        display: ['DM Serif Display', 'Georgia', 'serif'],
        heading: ['DM Sans', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['clamp(2.8rem, 6vw, 6rem)', { lineHeight: '1.06', letterSpacing: '-0.015em' }],
        'hero-sub': ['clamp(1.1rem, 1.5vw, 1.35rem)', { lineHeight: '1.7' }],
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
        'card': '0 2px 20px rgba(0,0,0,0.2)',
        'gold-glow': '0 0 40px rgba(201,169,110,0.12)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
