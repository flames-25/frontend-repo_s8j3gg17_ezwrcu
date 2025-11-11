/**** Tailwind config for Bina Ragam ****/
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F9F9F9',
        card: '#EDEDED',
        dark: '#2F343A',
        accent: '#8E96AA',
      },
      borderRadius: {
        '2xl': '1.25rem',
      }
    },
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui']
    }
  },
  plugins: [],
}
