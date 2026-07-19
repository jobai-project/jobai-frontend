import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { OnboardingNotificationSettingsRequest } from '@/types/member';
import {
  getMyPageInfo,
  updateJobPreferences,
  updateMemberName,
  saveOnboardingJobCategory,
  getNotificationSettings, 
  saveOnboardingNotificationSettings,
} from '@/api/member';

// 마이페이지(E1)·희망조건(E3). staleTime 은 main.tsx 전역 60초 사용.
export const memberKeys = { me: ['member', 'me'] as const };

const NOTIFICATION_SETTINGS_QUERY_KEY = ['notificationSettings'] as const;

// enabled 기본 true(하위호환) — FilterBar 는 게스트에서 발화 차단용으로 { enabled: !guest } 전달.
export const useMyPageInfo = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: memberKeys.me,
    queryFn: getMyPageInfo,
    enabled: options?.enabled ?? true,
  });

export const useUpdateJobPreferences = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateJobPreferences,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: memberKeys.me });
      qc.invalidateQueries({ queryKey: ['jobList'] }); // 조건 변경 → 추천 결과 변경
    },
  });
};

// E2 — 이름 수정
export const useUpdateName = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMemberName,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: memberKeys.me });
    },
  });
};

// 희망 직무만 독립적으로 교체(PATCH /onboarding/job-category).
// 지역·고용형태는 건드리지 않으므로 job-preferences PUT과 별도로 안전하게 호출 가능.
export const useUpdateJobCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveOnboardingJobCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: memberKeys.me });
      qc.invalidateQueries({ queryKey: ['jobList'] });
    },
  });
};

export const useNotificationSettings = () => {
  return useQuery({
    queryKey: NOTIFICATION_SETTINGS_QUERY_KEY,
    queryFn: getNotificationSettings,
  });
};
 
export const useUpdateNotificationSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: OnboardingNotificationSettingsRequest) =>
      saveOnboardingNotificationSettings(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATION_SETTINGS_QUERY_KEY });
    },
  });
};