/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: { dark: '#111A24', light: '#F8FAFC' },
        surface: { dark: '#1D2A37', muted: '#263442', light: '#FFFFFF' },
        ink: { primary: '#F7F9FC', dark: '#132033', secondary: '#A8B2C0', muted: '#788595' },
        border: { dark: '#33414F', light: '#D9E0E8' },
        accent: { blue: '#1677E8', orange: '#FFAE4A', gold: '#F6B51B', purple: '#C477F0' },
        gain: '#18C875',
        loss: '#F23555'
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      borderRadius: { card: '14px', hero: '32px', control: '10px', pill: '9999px' },
      boxShadow: {
        overlay: '0 10px 30px rgba(0, 0, 0, 0.20)',
        selected: '0 2px 10px rgba(19, 32, 51, 0.12)',
        glow: '0 0 32px rgba(71, 127, 255, 0.45)'
      }
    }
  },
  plugins: []
}
