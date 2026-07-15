import { apiClient } from './axios';
import { AuthUser, useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';

// Swagger 공통 응답 봉투
export interface ApiEnvelope<T> {
  isSuccess: boolean;
  code: string;
  message?: string;
  result: T;
}

interface GoogleLoginUrlResult {
  googleLoginUrl: string;
}

// 2-1. 구글 로그인 URL 조회 (인증 불필요)
export async function getGoogleLoginUrl(): Promise<string> {
  const { data } = await apiClient.get<ApiEnvelope<GoogleLoginUrlResult>>(
    '/api/v1/auth/login/google',
    {
      withCredentials: false,
      params: {
        t: Date.now(),
      },
    },
  );

  return data.result.googleLoginUrl;
}
// 2-2. 내 정보 조회 — 200이면 로그인 상태, 401이면 미로그인(throw)
// 🔴 서버 온보딩 플래그 필드명은 onboardingCompleted (프론트 AuthUser.onboarded와 다름).
//    매핑을 안 하면 user.onboarded가 항상 undefined → 게이트가 localStorage로만 판정됨.
interface RawMe {
  email: string;
  name: string;
  onboardingCompleted?: boolean;
}
export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<ApiEnvelope<RawMe>>('/api/v1/auth/me');
  const { email, name, onboardingCompleted } = data.result;
  return { email, name, onboarded: onboardingCompleted };
}

// 2-3. 로그아웃 — 서버가 accessToken 쿠키를 Max-Age=0으로 만료. 미로그인도 호출 가능.
export async function logout(): Promise<void> {
  await apiClient.post('/api/v1/auth/logout');
}

// 구글 로그인 페이지로 전체 이동(navigate 아님). 상대경로면 백엔드 origin을 붙인다.
// TODO(백엔드 연동 필요): googleLoginUrl이 항상 절대 URL이면 분기 불필요.
export function redirectToGoogleLogin(loginUrl: string): void {
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  const absoluteUrl = loginUrl.startsWith('http') ? loginUrl : `${base}${loginUrl}`;
  window.location.href = absoluteUrl;
}

// 로그인 버튼 핸들러: URL 조회 후 외부 이동.
export async function startGoogleLogin(): Promise<void> {
  const loginUrl = await getGoogleLoginUrl();
  redirectToGoogleLogin(loginUrl);
}

// 로그아웃 핸들러: 서버 만료 요청 + 클라 상태 초기화 + 로그인 화면으로.
export async function handleLogout(): Promise<void> {
  try {
    await logout();
  } finally {
    useAuthStore.getState().clearUser();
    useOnboardingStore.getState().reset();
    // replace로 이동: 로그아웃한 인증 페이지를 히스토리에 남기지 않아 뒤로가기 재진입 방지
    // (spec 2-2 replace:true 의도). 모듈 함수라 useNavigate 대신 location 사용 → 전체
    // 리로드로 메모리 스토어까지 확실히 초기화.
    window.location.replace('/login');
  }
}
