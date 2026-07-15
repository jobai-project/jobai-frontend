import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  OnboardingState,
  EMPLOYMENT_OPTIONS,
  ROLES,
} from '@/pages/Onboarding/types';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useConditionStore } from '@/stores/conditionStore';
import {
  saveOnboardingBasicInfo,
  saveOnboardingJobCategory,
  saveOnboardingNotificationSettings,
} from '@/api/member';

export function useSubmitOnboarding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const complete = useOnboardingStore((s) => s.complete);
  const setCondition = useConditionStore((s) => s.setCondition);

  return useMutation({
    // 🔴 순차 실행(Promise.all 금지). E6(notification)이 마지막이어야 한다 —
    //    서버가 E6에서 onboardingCompleted=true 를 세팅하므로, 먼저 실행되면
    //    희망조건이 빈 채로 '완료'가 되어 기존 '?? / 재온보딩' 버그가 재현된다.
    // 부분 실패 시 롤백하지 않고 throw → UI 실패 표시 → 재시도(각 PATCH 는 멱등 부분교체).
    mutationFn: async (s: OnboardingState) => {
      const career = s.employmentType[0];
      // ⚠️ 가드: employmentType 빈 배열이면 careerType undefined → E4가 400.
      //    TODO(UX): Step1에서 채용형태 필수 강제 or 제출 버튼 비활성(디자인 확인).
      if (!career) {
        throw new Error('채용 형태를 최소 1개 선택해주세요.');
      }

      // 라벨 상수(EMPLOYMENT_TYPE_LABELS/ROLE_LABELS)는 없음 → 기존 OPTIONS/ROLES 배열에서
      // 라벨 도출(UI 표시값과 전송값의 단일 소스 유지). 값은 반드시 한글 라벨(영문은 502).
      // ⚠️ TODO(BE): employmentType 은 다중선택 배열인데 careerType 은 단일 문자열 →
      //    현재 [0]만 전송, 사용자가 2개↑ 고르면 나머지 유실. (A)BE 배열화 (B)Step1 단일선택.
      await saveOnboardingBasicInfo({
        careerType: EMPLOYMENT_OPTIONS.find((o) => o.value === career)!.label,
        locations: s.locations,
      });
      await saveOnboardingJobCategory({
        jobCategories: s.jobRole
          ? [ROLES.find((r) => r.key === s.jobRole)!.label]
          : [],
      });
      // experience 는 UI 미렌더 죽은 값 → 전송하지 않는다.
      await saveOnboardingNotificationSettings({
        emailEnabled: s.notifyEmail,
        slackEnabled: false, // UI OFF 고정
        discordEnabled: false, // UI OFF 고정
        matchScoreThreshold: s.scoreThreshold,
      });
    },
    onSuccess: (_data, s) => {
      // conditionStore 는 홈 환영카드·필터 + MyPage 가 읽는 클라이언트 단일 소스라 유지(B4).
      // 서버 저장(E4~E6)과는 별개 경로.
      setCondition({
        locations: s.locations,
        experience: s.experience,
        jobTypes: s.jobTypes,
        scoreThreshold: s.scoreThreshold,
        jobRole: s.jobRole,
      });
      // 게이트 즉시 통과(+ localStorage). 다음 /auth/me 가 서버 onboardingCompleted 로 확정.
      complete();
      // 홈 목록 재조회 → 이력서 반영된 새 matchScore 표시.
      qc.invalidateQueries({ queryKey: ['jobList'] });
      navigate('/', { replace: true });
    },
  });
}
