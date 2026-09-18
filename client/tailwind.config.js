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
        dark: {
          950: '#0A0A0A',
          900: '#111111',
          850: '#151515',
          800: '#1A1A1A',
          750: '#222222',
          700: '#2A2A2A',
          600: '#3F3F46',
          500: '#52525B'
        },
        neon: {
          cyan: '#00F0FF',
          purple: '#A855F7',
          emerald: '#10B981',
          amber: '#F59E0B'
        },
        brand: {
          cyan: '#00F0FF',
          teal: '#14b8a6',
          indigo: '#6366f1',
          purple: '#8b5cf6',
          pink: '#ec4899',
          amber: '#f59e0b',
          emerald: '#10b981'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif']
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 30s linear infinite',
        'marquee-fast': 'marquee 15s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite'
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' }
        }
      }
    },
  },
  plugins: [],
}
