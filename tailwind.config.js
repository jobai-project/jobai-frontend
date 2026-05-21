/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#FAFAFA',
          surface: '#FFFFFF',
          border: '#E5E5E5',
          'border-strong': '#BDBDBD',
          text: '#1F1F1F',
          'text-muted': '#6B6B6B',
          'text-subtle': '#9A9A9A',
          hover: '#F2F2F2',
          active: '#EAEAEA',
          gauge: '#2E2E2E',
          'gauge-track': '#E5E5E5',
        },
      },
      fontFamily: {
        sans: [
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
