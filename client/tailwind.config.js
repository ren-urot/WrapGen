/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0F0F0F',
        electric: '#007BFF',
        cyan: '#00D1FF',
        'dark-grey': '#2B2B2B',
        lime: '#A3FF12',
        'light-grey': '#F5F5F5',
        panel: '#111111',
        border: '#2B2B2B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
      },
    },
  },
  plugins: [],
};
