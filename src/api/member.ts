import { apiClient } from '@/api/axios';
import type { ApiEnvelope } from '@/api/auth'; // 정본 envelope (types/api.ts는 없음)
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type {
  OnboardingBasicInfoRequest,
  OnboardingJobCategoryRequest,
  OnboardingNotificationSettingsRequest,
  MemberMeResponse,
  UpdateJobPreferencesRequest,
  UpdateNameRequest,
  NotificationSettingsResponse,
} from '@/types/member';

// 온보딩 제출 3단계 PATCH. 인터셉터가 (res)=>res 라 res.data.result 수동 언랩.
// withCredentials 는 axios.ts 전역 설정 → 개별 지정 불필요.

// E4 — 기본 정보(경력 유형 + 희망 지역)
export const saveOnboardingBasicInfo = async (
  body: OnboardingBasicInfoRequest,
) => {
  const res = await apiClient.patch<ApiEnvelope<unknown>>(
    '/api/v1/members/me/onboarding/basic-info',
    body,
  );
  return res.data.result;
};

// E5 — 희망 직무 카테고리
export const saveOnboardingJobCategory = async (
  body: OnboardingJobCategoryRequest,
) => {
  const res = await apiClient.patch<ApiEnvelope<unknown>>(
    '/api/v1/members/me/onboarding/job-category',
    body,
  );
  return res.data.result;
};

// E6 — 알림 설정 (마지막: 서버가 onboardingCompleted=true 세팅)
export const saveOnboardingNotificationSettings = async (
  body: OnboardingNotificationSettingsRequest,
) => {
  const res = await apiClient.patch<ApiEnvelope<unknown>>(
    '/api/v1/members/me/onboarding/notification-settings',
    body,
  );
  return res.data.result;
};

// E1 — 마이페이지 정보 조회
export const getMyPageInfo = async (): Promise<MemberMeResponse> => {
  const res = await apiClient.get<ApiEnvelope<MemberMeResponse>>(
    '/api/v1/members/me',
  );
  return res.data.result;
};

// E3 — 희망 조건 수정 (🔴 PUT = careerType·jobCategories·locations 전체 교체)
export const updateJobPreferences = async (
  body: UpdateJobPreferencesRequest,
) => {
  const res = await apiClient.put<ApiEnvelope<unknown>>(
    '/api/v1/members/me/job-preferences',
    body,
  );
  return res.data.result;
};

// E2 — 이름 수정. 서버가 공백만 있는 이름·20자 초과를 400으로 거부한다.
export const updateMemberName = async (body: UpdateNameRequest) => {
  const res = await apiClient.patch<ApiEnvelope<string>>(
    '/api/v1/members/me/name',
    body,
  );
  return res.data.result;
};

// GET — 알림 설정 조회 (이메일/Slack/Discord 토글 + 매칭 점수 기준)
export const getNotificationSettings = async (): Promise<NotificationSettingsResponse> => {
  const res = await apiClient.get<ApiEnvelope<NotificationSettingsResponse>>(
    '/api/v1/members/me/notification-settings',
  );
  return res.data.result;
};

// DELETE — 회원 탈퇴 (hard delete, 비가역). 파라미터·요청 바디 없음. 200 result는 문자열.
// 성공 시 서버가 accessToken / refreshToken 쿠키를 만료시킨다.
// 인터셉터가 (res) => res 라 res.data.result 수동 언랩(axios.ts:18) — 파일 기존 스타일 준수.
export const deleteMember = async (): Promise<string> => {
  const res = await apiClient.delete<ApiEnvelope<string>>('/api/v1/members/me');
  return res.data.result;
};

/**
 * 회원 탈퇴 후 세션 정리.
 * handleLogout(src/api/auth.ts:65)과 동일한 순서·방식(전체 리로드)을 따르되, 딱 하나가 다르다:
 * 로그아웃은 try/finally라 API가 실패해도 정리하지만, 탈퇴는 API가 실패하면 계정이
 * 아직 살아 있으므로 clearUser/reset/replace 를 실행하면 안 된다.
 * 그래서 finally가 아니라 성공(await 통과) 경로에서만 정리하고, 실패는 호출부로 전파한다.
 */
export const handleWithdraw = async (): Promise<void> => {
  await deleteMember(); // 실패 시 여기서 throw → 아래 정리 단계 진입 안 함

  useAuthStore.getState().clearUser(); // authStore.ts:25
  // 🔴 hard delete라 재로그인 시 신규 회원 → 온보딩 1단계. reset 누락 시 이전 입력값이
  //    프리필되는 버그(스펙 §3.3). handleLogout(auth.ts:70)과 동일하게 반드시 포함.
  useOnboardingStore.getState().reset();

  // 모듈 함수라 useNavigate 사용 불가 + 전체 리로드로 메모리 스토어 확실 초기화
  // (auth.ts:71-74와 동일한 이유)
  window.location.replace('/login');
};