/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#050A12',
          surface: '#0B1320',
          card: 'rgba(11, 19, 32, 0.85)',
          raised: 'rgba(255, 255, 255, 0.04)',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 255, 255, 0.16)',
        },
        accent: {
          blue: '#2F7BFF',
          blueHover: '#1D68EE',
          blueGlow: 'rgba(47, 123, 255, 0.25)',
        },
        tclass: {
          industrial: '#FF3B47',
          flare: '#FF8A1F',
          wildfire: '#22C55E',
          agri: '#F5B82E',
          mining: '#A855F7',
          other: '#B8C0CC',
          facility: '#3B82F6',
        },
        risk: {
          critical: '#EF3340',
          high: '#FF8A1F',
          medium: '#F5B82E',
          low: '#22B8CF',
        },
        ttext: {
          primary: '#E8EDF5',
          muted: '#8B98AB',
          faint: '#5F6B7E',
        },
        tstatus: {
          live: '#22C55E',
          stale: '#F5B82E',
          sim: '#8B5CF6',
          demo: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(47, 123, 255, 0.25)',
        glowRed: '0 0 24px rgba(239, 51, 64, 0.25)',
        glowOrange: '0 0 24px rgba(255, 138, 31, 0.25)',
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
      backdropBlur: {
        glass: '12px',
      }
    },
  },
  plugins: [],
}
