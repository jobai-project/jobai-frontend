import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  OnboardingState,
  EMPLOYMENT_OPTIONS,
  ROLES,
} from '@/pages/Onboarding/types';
import { useOnboardingStore } from '@/stores/onboardingStore';
import {
  saveOnboardingBasicInfo,
  saveOnboardingJobCategory,
  saveOnboardingNotificationSettings,
} from '@/api/member';

export function useSubmitOnboarding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const complete = useOnboardingStore((s) => s.complete);

  return useMutation({
    // 🔴 순차 실행(Promise.all 금지). E6(notification)이 마지막이어야 한다 —
    //    서버가 E6에서 onboardingCompleted=true 를 세팅하므로, 먼저 실행되면
    //    희망조건이 빈 채로 '완료'가 되어 기존 '?? / 재온보딩' 버그가 재현된다.
    // 부분 실패 시 롤백하지 않고 throw → UI 실패 표시 → 재시도(각 PATCH 는 멱등 부분교체).
    mutationFn: async (s: OnboardingState) => {
      // ⚠️ 가드: E4는 careerType 1개 이상 필수(0개면 400).
      // TODO(UX): Step1에서 채용형태 필수 강제 or 제출 버튼 비활성(디자인 확인).
      if (s.employmentType.length === 0) {
        throw new Error('채용 형태를 최소 1개 선택해주세요.');
      }

      // 라벨 상수(EMPLOYMENT_TYPE_LABELS/ROLE_LABELS)는 없음 → 기존 OPTIONS/ROLES 배열에서
      // 라벨 도출(UI 표시값과 전송값의 단일 소스 유지). 값은 반드시 한글 라벨(영문은 502).
      // ✅ BE 배열화 반영 완료 → 다중선택 전량 전송(기존 [0] 유실 버그 해소).
      await saveOnboardingBasicInfo({
        careerType: s.employmentType.map(
          (v) => EMPLOYMENT_OPTIONS.find((o) => o.value === v)!.label,
        ),
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
        slackEnabled: s.notifySlack,        
        discordEnabled: s.notifyDiscord,    
        matchScoreThreshold: s.scoreThreshold,
        slackWebhookUrl: s.slackWebhookUrl,       
        discordWebhookUrl: s.discordWebhookUrl, 
      });
    },
    onSuccess: () => {
      // 게이트 즉시 통과(+ localStorage). 다음 /auth/me 가 서버 onboardingCompleted 로 확정.
      complete();
      // 서버(E1)가 조건의 단일 소스 — 홈 WelcomeCard(직무)·목록(matchScore) 재조회.
      qc.invalidateQueries({ queryKey: ['member', 'me'] });
      qc.invalidateQueries({ queryKey: ['jobList'] });
      qc.invalidateQueries({ queryKey: ['notificationSettings'] });
      navigate('/', { replace: true });
    },
  });
}
