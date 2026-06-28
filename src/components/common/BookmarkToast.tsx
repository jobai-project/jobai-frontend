import { useEffect, useState } from 'react';
import { useToastStore } from '@/stores/toastStore';

// 스크랩(북마크 추가) 시 하단 중앙에 잠깐 떴다 사라지는 알림 토스트.
// App 최상단에 1회만 마운트한다.
export default function BookmarkToast() {
  const message = useToastStore((s) => s.message);
  const visible = useToastStore((s) => s.visible);
  const [render, setRender] = useState(false);

  // 퇴장 애니메이션(200ms)이 끝난 뒤 DOM에서 제거한다.
  useEffect(() => {
    if (visible) {
      setRender(true);
    } else if (render) {
      const t = setTimeout(() => setRender(false), 200);
      return () => clearTimeout(t);
    }
  }, [visible, render]);

  if (!render) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      // 너비는 Hug: 문구 길이에 맞춰 w-fit + 좌우 padding (254px 하드코딩 금지).
      // 높이만 44px 고정. radius/배경/그림자는 Figma 확정값 적용.
      // 타이포: SubBody(Pretendard 14px / Medium / line-height 150% / letter-spacing -0.28px).
      className={`fixed bottom-8 left-1/2 z-50 inline-flex h-[44px] w-fit -translate-x-1/2
                  items-center justify-center px-4 rounded-[24.762px] bg-gray-500
                  shadow-[0_0_15.2px_0_rgba(90,90,90,0.20)]
                  text-white text-center font-medium font-pretendard
                  text-[14px] leading-[150%] tracking-[-0.28px]
                  motion-reduce:animate-none ${
                    visible ? 'animate-toast-in' : 'animate-toast-out'
                  }`}
    >
      {message}
    </div>
  );
}
