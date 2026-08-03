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
          50: '#f4f6fe',
          100: '#e9edfd',
          200: '#d3dbfb',
          300: '#adbdf8',
          400: '#7d95f2',
          500: '#4f68eb',
          600: '#3b4ee0',
          700: '#2f3ec8',
          800: '#2b35a3',
          900: '#273183',
          950: '#181b4d',
        },
        slateDark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      }
    },
  },
  plugins: [],
}
