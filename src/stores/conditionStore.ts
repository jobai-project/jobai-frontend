import { create } from 'zustand';
import {
  loadCondition,
  saveCondition,
  clearCondition,
  type UserCondition,
} from '@/utils/conditionStorage';

interface ConditionStore {
  condition: UserCondition | null; // React가 추적하는 진실값
  setCondition: (c: UserCondition) => void; // 온보딩 완료/조건 수정 시
  reset: () => void;
}

// 조건의 단일 소스. 온보딩·홈 필터·마이페이지가 모두 이 값을 읽고 쓴다.
// BE 연동 시 loadCondition/saveCondition 내부만 서버 호출로 바꾸면
// 이 스토어와 호출부는 그대로 유지된다.
export const useConditionStore = create<ConditionStore>((set) => ({
  condition: loadCondition(), // 앱 시작 시 localStorage에서 1회 hydration

  setCondition: (c) => {
    saveCondition(c); // 영속화
    set({ condition: c }); // React 상태 갱신 → 구독 컴포넌트 자동 리렌더
  },

  reset: () => {
    clearCondition();
    set({ condition: null });
  },
}));
