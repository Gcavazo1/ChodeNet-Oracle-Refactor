/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './ChodeNet-Leaderboard-System-main/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'electric-blue': {
          DEFAULT: '#00D4FF',
          dark: '#0099CC',
          50: '#E6F9FF',
          100: '#CCF3FF',
          200: '#99E7FF',
          300: '#66DBFF',
          400: '#33CFFF',
          500: '#00D4FF',
          600: '#00A3CC',
          700: '#007299',
          800: '#004166',
          900: '#001033'
        },
        'cyber-gold': {
          DEFAULT: '#FFD700',
          dark: '#FFA500',
          50: '#FFFEF0',
          100: '#FFFDE0',
          200: '#FFFBC2',
          300: '#FFF9A3',
          400: '#FFF785',
          500: '#FFD700',
          600: '#FFCC00',
          700: '#E6B800',
          800: '#CCA300',
          900: '#B38F00'
        }
      },
      animation: {
        'electric-pulse': 'electric-pulse 2s ease-in-out infinite',
        'gold-pulse': 'gold-pulse 2s ease-in-out infinite',
        'liquid-morph': 'liquid-morph 8s ease-in-out infinite',
        'liquid-slide-in': 'liquid-slide-in 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'legendary-liquid-pulse': 'legendary-liquid-pulse 3s infinite',
        'liquid-bump': 'liquid-bump 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'liquid-loading': 'liquid-loading 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'grid-pulse': 'grid-pulse 4s ease-in-out infinite',
        'float-drift-1': 'float-drift-1 20s ease-in-out infinite',
        'float-drift-2': 'float-drift-2 25s ease-in-out infinite reverse',
        'float-drift-3': 'float-drift-3 30s ease-in-out infinite',
        'float-drift-4': 'float-drift-4 22s ease-in-out infinite reverse',
        'float-drift-5': 'float-drift-5 18s ease-in-out infinite'
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'glow-electric': '0 0 10px rgba(0, 212, 255, 0.3), inset 0 0 10px rgba(0, 212, 255, 0.1), 0 0 20px rgba(0, 212, 255, 0.2)',
        'glow-gold': '0 0 10px rgba(255, 215, 0, 0.3), inset 0 0 10px rgba(255, 215, 0, 0.1), 0 0 20px rgba(255, 215, 0, 0.2)',
        'liquid-glass': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 20px rgba(0, 212, 255, 0.1)',
        'liquid-glass-intense': '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 30px rgba(0, 212, 255, 0.2), 0 0 60px rgba(255, 215, 0, 0.1)'
      },
      textShadow: {
        'glow-electric': '0 0 5px #00D4FF, 0 0 10px #00D4FF, 0 0 15px #00D4FF, 0 0 20px #00D4FF',
        'glow-gold': '0 0 5px #FFD700, 0 0 10px #FFD700, 0 0 15px #FFD700, 0 0 20px #FFD700'
      }
    },
  },
  plugins: [],
};
