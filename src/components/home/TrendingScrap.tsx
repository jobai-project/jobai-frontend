import { useEffect, useState } from 'react';

export interface TrendingScrapItem {
  id: string;
  rank: number;
  title: string;
  company: string;
}

interface TrendingScrapProps {
  items: TrendingScrapItem[];
  intervalMs?: number;
}

export default function TrendingScrap({
  items,
  intervalMs = 3000,
}: TrendingScrapProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, intervalMs]);

  if (items.length === 0) return null;

  const current = items[index];

  return (
    // Figma 1648:16410 정합: 알약/라벨/구분선 제거 → 평문 행. px-[24px]로 검색 텍스트와 좌측 정렬.
    // items-end + gap-[8px] (Figma). mb-5 제거(간격은 TopBar 컬럼 gap-[16px]이 담당).
    <div className="flex px-[24px]" aria-live="polite">
      <button
        key={current.id}
        type="button"
        // TODO(실데이터): 실시간 순위 API 연동 시 상세 이동 복구. 지금은 mockJobs 기반이라
        // source 가 없고 mock id 가 실제 API id 와 안 맞아 엉뚱한 상세가 뜰 위험 → 비활성.
        className="animate-fade-up flex min-w-0 flex-1 items-end gap-[8px] text-left"
      >
        <span className="shrink-0 text-[16px] font-medium tracking-[-0.32px] text-gray-700">
          {current.rank}
        </span>
        <span className="truncate text-[16px] font-medium tracking-[-0.32px] text-gray-700">
          {current.title}
        </span>
        <span className="shrink-0 text-[14px] font-normal tracking-[-0.28px] text-app-text-subtle">
          {current.company}
        </span>
      </button>
    </div>
  );
}
