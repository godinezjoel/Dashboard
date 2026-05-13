/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Base dark palette
        surface: {
          50: '#f8f9ff',
          100: '#1a1b2e',
          200: '#16172a',
          300: '#12131f',
          400: '#0d0e18',
          500: '#09090f',
        },
        // Accent – violet/purple
        accent: {
          50: '#f3f0ff',
          100: '#e2daff',
          200: '#c4b6ff',
          300: '#a78bff',
          400: '#8b5cf6',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
        },
        // Success green for XP
        xp: {
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
        },
        // Warning amber for coins
        coin: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
        },
        // Health red→green gradient
        health: {
          low: '#ef4444',
          mid: '#f59e0b',
          high: '#10b981',
        },
        // Cyberpunk theme tokens
        cyber: {
          bg: '#05010d',
          surface: '#0f0a1e',
          accent: '#00fff5',
          secondary: '#bf00ff',
          text: '#e0e0ff',
        },
        // Forest theme tokens
        forest: {
          bg: '#030d06',
          surface: '#061410',
          accent: '#00e676',
          secondary: '#76ff03',
          text: '#c8ffd4',
        },
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-xp': '0 0 20px rgba(52, 211, 153, 0.3)',
        'glow-coin': '0 0 20px rgba(251, 191, 36, 0.3)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.4)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-dark': 'linear-gradient(135deg, #1a1b2e 0%, #12131f 50%, #0d0e18 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'bounce-coin': 'bounceCoin 0.6s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        slideIn: {
          from: { opacity: 0, transform: 'translateX(-12px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(4px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        bounceCoin: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: 1 },
          '60%': { transform: 'translateY(-24px) scale(1.2)', opacity: 1 },
          '100%': { transform: 'translateY(-40px) scale(0.8)', opacity: 0 },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(139, 92, 246, 0.4)' },
          '50%': { boxShadow: '0 0 24px rgba(139, 92, 246, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};
