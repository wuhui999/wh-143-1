/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        kiln: {
          primary: '#D2691E',
          secondary: '#CD853F',
          light: '#DEB887',
          dark: '#8B4513',
          charcoal: '#2F2F2F',
          gold: '#FFD700'
        }
      },
      fontFamily: {
        title: ['"Ma Shan Zheng"', 'cursive'],
        body: ['"PingFang SC"', '"Microsoft YaHei"', 'sans-serif']
      },
      animation: {
        'smoke-rise': 'smokeRise 3s ease-out infinite',
        'flame-flicker': 'flameFlicker 0.5s ease-in-out infinite alternate',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.6s ease-out'
      },
      keyframes: {
        smokeRise: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0.7' },
          '100%': { transform: 'translateY(-60px) scale(1.5)', opacity: '0' }
        },
        flameFlicker: {
          '0%': { transform: 'scaleY(1)', opacity: '0.9' },
          '100%': { transform: 'scaleY(1.1)', opacity: '1' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255, 165, 0, 0.5)' },
          '50%': { boxShadow: '0 0 25px rgba(255, 165, 0, 0.8)' }
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      }
    }
  },
  plugins: []
};
