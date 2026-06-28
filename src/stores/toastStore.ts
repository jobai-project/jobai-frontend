import { create } from 'zustand';

// 전역 토스트 상태. 여러 화면(홈·상세·스크랩)에서 공통으로 쓰므로
// bookmarkStore와 분리해 토스트 책임만 담당한다.
interface ToastState {
  message: string | null;
  visible: boolean;
  showToast: (message: string) => void;
  hideToast: () => void;
}

// 모듈 스코프 타이머: 중복 스택을 막고 재호출 시 리셋한다.
let timer: ReturnType<typeof setTimeout> | null = null;

// 디자이너 확정: 완전히 보이는 상태 유지 2.5초 (진입/퇴장 애니메이션 시간 제외)
const VISIBLE_DURATION = 2500;

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  visible: false,
  showToast: (message) => {
    if (timer) clearTimeout(timer); // 이미 떠 있으면 타이머 리셋 + 메시지 갱신
    set({ message, visible: true });
    timer = setTimeout(() => {
      set({ visible: false }); // 퇴장 애니메이션 트리거 (DOM 제거는 컴포넌트가 처리)
      timer = null;
    }, VISIBLE_DURATION);
  },
  hideToast: () => {
    if (timer) clearTimeout(timer);
    timer = null;
    set({ visible: false });
  },
}));
