/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36a9f6',
          500: '#0c8ee7',
          600: '#0270c5',
          700: '#0359a0',
          800: '#074c83',
          900: '#0c3f6d',
          950: '#082848',
        },
        navy: {
          800: '#0F172A',
          900: '#0B1120',
          950: '#060A12',
        },
        accent: {
          purple: '#6366F1',
          teal: '#0D9488',
          amber: '#F59E0B',
          emerald: '#10B981',
          rose: '#F43F5E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'subtle': '0 4px 20px -2px rgba(12, 63, 109, 0.08)',
      }
    },
  },
  plugins: [],
}
