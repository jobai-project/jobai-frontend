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
    <div
      className="mb-5 flex h-9 items-center gap-2 rounded-full border border-app-border bg-app-surface px-3.5 text-xs text-app-text-muted"
      aria-live="polite"
    >
      <span className="flex-shrink-0 font-semibold text-app-text-subtle">
        실시간 스크랩
      </span>
      <span aria-hidden="true" className="h-3 w-px bg-app-border" />
      <button
        key={current.id}
        type="button"
        // TODO(실데이터): 실시간 순위 API 연동 시 상세 이동 복구. 지금은 mockJobs 기반이라
        // source 가 없고 mock id 가 실제 API id 와 안 맞아 엉뚱한 상세가 뜰 위험 → 비활성.
        className="animate-fade-up flex min-w-0 flex-1 items-center gap-2 text-left transition hover:text-app-text"
      >
        <span className="flex-shrink-0 font-bold text-app-text">
          {current.rank}
        </span>
        <span className="truncate text-app-text">{current.title}</span>
        <span className="flex-shrink-0 text-app-text-subtle">
          {current.company}
        </span>
      </button>
    </div>
  );
}
