import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { ScrapRanking } from '@/types/jobApi';

interface TrendingScrapProps {
  items: ScrapRanking[];
  intervalMs?: number;
}

export default function TrendingScrap({
  items,
  intervalMs = 3000,
}: TrendingScrapProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    // 항목 1개 이하면 롤링 미가동. hover 중(paused)에도 정지 — 클릭 직전 전환으로 인한
    // 엉뚱한 공고 이동 방지(간격 3000ms, 사용자가 원인 인지 불가).
    if (items.length <= 1 || paused) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, intervalMs, paused]);

  if (items.length === 0) return null;

  // 항목 수 변동(비동기 로드) 대비 — index 를 항상 범위 내로 보정.
  const current = items[index % items.length];

  const handleClick = () => {
    // 비로그인 → 로그인. 로그인 → 상세(/jobs/:source/:id, DeadlineCard 와 동형).
    // 로그인 후 원래 공고 복귀는 범위 밖(확정).
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/jobs/${current.source}/${current.sourceId}`);
  };

  return (
    // Figma 1648:16410 정합: 알약/라벨/구분선 제거 → 평문 행. px-[24px]로 검색 텍스트와 좌측 정렬.
    // items-end + gap-[8px] (Figma). mb-5 제거(간격은 TopBar 컬럼 gap-[16px]이 담당).
    <div
      className="flex px-[24px]"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button
        key={`${current.source}-${current.sourceId}`}
        type="button"
        onClick={handleClick}
        // TODO(Figma): hover 스타일 시안 미확인 → 최소 cursor-pointer만. 확정 시 hover 색/배경 추가.
        className="animate-fade-up flex min-w-0 flex-1 cursor-pointer items-end gap-[8px] text-left"
      >
        <span className="shrink-0 text-[16px] font-medium tracking-[-0.32px] text-gray-700">
          {current.rank}
        </span>
        <span className="truncate text-[16px] font-medium tracking-[-0.32px] text-gray-700">
          {current.title}
        </span>
        <span className="shrink-0 text-[14px] font-normal tracking-[-0.28px] text-app-text-subtle">
          {current.companyName}
        </span>
      </button>
    </div>
  );
}
