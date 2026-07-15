import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://api.jobai.site';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  withCredentials: true,
});

// 쿠키(HttpOnly) 방식이라 Authorization 헤더 인터셉터는 두지 않는다.
// 401이면 로그인 상태만 초기화한다. (라우트 리다이렉트는 ProtectedRoute가 담당 —
// 여기서 강제 이동하면 /auth/me 자체의 401에도 무한 루프가 날 수 있어 생략.)
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearUser();
      useOnboardingStore.getState().reset();
    }
    return Promise.reject(error);
  },
);
