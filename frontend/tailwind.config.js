/** Palette from the dashboard mockup: deep navy chrome, county green for actions, soft blue surfaces. */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 50: '#eef3fb', 100: '#dbe6f6', 200: '#b9cdea', 500: '#1f5bb8', 600: '#1b4a94', 700: '#12397a', 800: '#0d2c62', 900: '#081f4a' },
        brand: { 50: '#ecfbf1', 100: '#d0f5dd', 200: '#a2e8bb', 500: '#22a851', 600: '#1c9a47', 700: '#167c39', 800: '#12652f' },
        ink: { 50: '#f3f7fc', 100: '#e6ecf5', 200: '#d3dcea', 300: '#b0bdd2', 400: '#8493ad', 500: '#5f6f8c', 600: '#44536e', 700: '#2b3a55', 800: '#1a2740', 900: '#0c1a33' },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-poppins)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        script: ['var(--font-script)', 'cursive'],
      },
      boxShadow: { tile: '0 1px 2px rgba(12,26,51,.05), 0 6px 18px rgba(12,26,51,.06)' },
    },
  },
  plugins: [],
};
