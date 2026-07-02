import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createCondition, CreateConditionRequest } from '@/api/conditions';
import { OnboardingState } from '@/pages/Onboarding/types';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useConditionStore } from '@/stores/conditionStore';

export function useSubmitOnboarding() {
  const navigate = useNavigate();
  const complete = useOnboardingStore((s) => s.complete);
  const setCondition = useConditionStore((s) => s.setCondition);
  return useMutation({
    mutationFn: (s: OnboardingState) => {
      const payload: CreateConditionRequest = {
        keywords: s.jobTypes,
        locations: s.locations,
        jobTypes: s.jobTypes,
        experience: [s.experience], // 단일값 배열 래핑 (spec §9.3)
        scoreThreshold: s.scoreThreshold,
        notifyEmail: s.notifyEmail,
        slackWebhook: s.slackWebhook,
        discordWebhook: s.discordWebhook,
        isActive: true,
      };
      return createCondition(payload);
    },
    onSuccess: (_data, s) => {
      // 사용자가 입력한 조건을 단일 소스(conditionStore)에 저장. 홈 환영카드·
      // 필터가 이 값을 읽는다. (s = mutate에 넘긴 OnboardingState)
      setCondition({
        locations: s.locations,
        experience: s.experience,
        jobTypes: s.jobTypes,
        scoreThreshold: s.scoreThreshold,
        // 홈 히어로 카드가 역할별 이미지/태그를 고르는 소스. (spec §1.2 ⚠️)
        // TODO(확인 필요): 이 역할을 온보딩 selectedRole 재사용으로 확정할지,
        // 별도 사용자 프로파일 값으로 둘지 디자이너/BE 확인 후 결정.
        jobRole: s.jobRole,
      });
      // 완료 표시는 스토어 complete() 단일 진입점으로. (localStorage 영속화 +
      // React 상태 갱신이 함께 일어나므로 navigate 시점에 게이트가 새 값을 본다.)
      complete();
      navigate('/', { replace: true });
    },
  });
}
