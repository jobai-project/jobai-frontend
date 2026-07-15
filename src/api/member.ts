import { apiClient } from '@/api/axios';
import type { ApiEnvelope } from '@/api/auth'; // 정본 envelope (types/api.ts는 없음)
import type {
  OnboardingBasicInfoRequest,
  OnboardingJobCategoryRequest,
  OnboardingNotificationSettingsRequest,
  MemberMeResponse,
  UpdateJobPreferencesRequest,
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
