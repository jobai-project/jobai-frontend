import { create } from 'zustand';
import {
  isOnboarded,
  markOnboarded as persistOnboarded,
  resetOnboarded as clearOnboarded,
} from '@/utils/onboardingStorage';

interface OnboardingState {
  onboarded: boolean; // React가 추적하는 진실값
  complete: () => void; // 완료: 상태 + localStorage 동시 갱신
  reset: () => void; // 개발용 초기화
}

// localStorage는 React 바깥의 "메모장"이라 값이 바뀌어도 React가 스스로 알지 못한다.
// 판정값을 스토어 상태로 승격해 두면, complete()가 값을 바꾸는 순간 구독 컴포넌트가
// 자동으로 다시 평가된다. (게이트가 옛 값으로 얼어붙는 버그 방지)
export const useOnboardingStore = create<OnboardingState>((set) => ({
  // 앱 시작 시 localStorage에서 1회 hydration
  onboarded: isOnboarded(),

  complete: () => {
    persistOnboarded(); // localStorage "true" (영속화)
    set({ onboarded: true }); // React 상태 갱신 → 구독 컴포넌트 자동 리렌더
  },

  reset: () => {
    clearOnboarded();
    set({ onboarded: false });
  },
}));
