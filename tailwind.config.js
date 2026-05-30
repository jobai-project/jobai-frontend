/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#FAFAFA',
          surface: '#FFFFFF',
          border: '#D0D6DD',
          'border-strong': '#AFBBC2',
          text: '#172129',
          'text-muted': '#687685',
          'text-subtle': '#8995A2',
          hover: '#F2F4F6',
          active: '#F5F5FF',
          primary: '#4741FF',
          'primary-soft': '#EBECFF',
          'primary-weak': '#F5F5FF',
          sidebar: {
            logo: '#4741FF',
            active: '#F5F5FF',
            'active-text': '#4741FF',
            muted: '#8995A2',
            'icon-muted': '#D0D6DD',
          },
          gauge: '#2E2E2E',
          'gauge-track': '#E6E8EB',
        },
        purple: {
          50: '#F5F5FF',
          500: '#4741FF',
          600: '#3C36E3',
        },
        success: {
          base: '#10B981',
        },
        error: {
          base: '#EF4444',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      borderRadius: {
        base: '8px',
        md: '12px',
        lg: '16px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
      backgroundImage: {
        'card-gradient': 'linear-gradient(135deg, #F5F5FF 0%, #FFFFFF 100%)',
        'progress-blue': 'linear-gradient(to right, #7682FF, #4741FF)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 300ms ease-out',
      },
    },
  },
  plugins: [],
};
