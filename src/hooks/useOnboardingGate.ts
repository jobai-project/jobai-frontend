import { useOnboardingStore } from '@/stores/onboardingStore';

interface OnboardingGate {
  /** true면 온보딩을 보여줘야 함 (첫 진입/미완료) */
  needsOnboarding: boolean;
}

/**
 * 실제 onboarded 플래그/엔드포인트가 도입되기 전까지의 임시 게이트(읽기 전용).
 *
 * 스토어의 onboarded 값을 "구독"한다. complete()로 값이 바뀌면 이 훅을 쓰는
 * 컴포넌트가 자동 리렌더되어 게이트가 다시 평가된다. (useMemo([]) 로 얼어붙던
 * 옛 버그 해소)
 *
 * 계약(Contract):
 * - 이 훅은 읽기 전용이다. 여기서 onboarded를 바꾸지 않는다.
 * - 완료 표시는 오직 useOnboardingStore의 complete() 로만 한다.
 */
export function useOnboardingGate(): OnboardingGate {
  const onboarded = useOnboardingStore((s) => s.onboarded);
  return { needsOnboarding: !onboarded };
}
