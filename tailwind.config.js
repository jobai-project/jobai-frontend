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
          100: '#EBECFF',
          200: '#C0C5FF',
          300: '#A1A9FF',
          400: '#7682FF',
          500: '#4741FF',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F2F4F6',
          200: '#E6E8EB',
          300: '#D0D6DD',
          400: '#AFB8C2',
          500: '#8995A2',
          600: '#687685',
          700: '#4B5969',
          800: '#303D42',
          900: '#171F29',
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
        // 토스트 등 Pretendard 확정 컴포넌트용 별칭 (전역 기본은 sans 유지).
        pretendard: [
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
        // 토스트 진입: 살짝 위로 슬라이드 + 페이드인 (가로 중앙 정렬 유지)
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateX(-50%) translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateX(-50%) translateY(0)' },
        },
        // 토스트 퇴장: 페이드아웃 + 살짝 아래로 슬라이드
        'toast-out': {
          '0%': { opacity: '1', transform: 'translateX(-50%) translateY(0)' },
          '100%': { opacity: '0', transform: 'translateX(-50%) translateY(8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 300ms ease-out',
        'toast-in': 'toast-in 220ms ease-out',
        'toast-out': 'toast-out 200ms ease-in forwards',
      },
    },
  },
  plugins: [],
};
