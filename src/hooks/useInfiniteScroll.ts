import { useEffect, useRef } from 'react';

// 무한스크롤 센티넬. 반환 ref 를 목록 하단 빈 div 에 걸면, 뷰포트 진입 시 onReach 호출.
// enabled(=hasNextPage) 가 false 면 관찰하지 않는다.
export function useInfiniteScroll(onReach: () => void, enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) onReach();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [onReach, enabled]);

  return ref;
}
