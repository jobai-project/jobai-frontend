import { useNavigate } from 'react-router-dom';
import { useToggleScrap, useScrapSet } from '@/hooks/useScraps';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { toScrapKey, type ScrapSource, type Scrap } from '@/types/scrap';

interface BookmarkButtonProps {
  source: ScrapSource;
  sourceId: number;
  // 추가 시 목록에 낙관적으로 넣을 데이터(카드/상세에서 구성). 없으면 최소 stub + invalidate 정정.
  optimistic?: Scrap;
  className?: string;
  // 'lg' = 상세 페이지(아이콘 36px/버튼 44px). 기본은 카드용(20/32).
  size?: 'default' | 'lg';
}

export default function BookmarkButton({
  source,
  sourceId,
  optimistic,
  className = '',
  size = 'default',
}: BookmarkButtonProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const scrapSet = useScrapSet();
  const toggle = useToggleScrap();

  const btnSize = size === 'lg' ? 'h-11 w-11' : 'h-8 w-8'; // 44 vs 32
  const iconSize = size === 'lg' ? 'h-9 w-9' : 'h-5 w-5'; // 36 vs 20
  const isBookmarked = scrapSet.has(toScrapKey(source, sourceId));

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // 비로그인은 API 호출 시 401 → 로그인 유도로 대체
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const willAdd = !isBookmarked;
    toggle.mutate({ source, sourceId, scrapped: isBookmarked, optimistic });
    // 추가할 때만 토스트 (해제 시엔 띄우지 않음 — 확정 사항)
    if (willAdd) {
      useToastStore.getState().showToast('선택한 공고를 스크랩 목록에 추가했어요');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={toggle.isPending}
      aria-label={isBookmarked ? '스크랩 취소' : '스크랩'}
      aria-pressed={isBookmarked}
      className={`inline-flex ${btnSize} items-center justify-center rounded-full text-lg transition hover:bg-app-hover disabled:opacity-50 ${className}`}
    >
      {isBookmarked ? (
        <svg
          viewBox="0 0 20 20"
          className={`${iconSize} fill-blue-600`}
          aria-hidden="true"
        >
          <path d="M5 3a1 1 0 0 0-1 1v14l6-3.5L16 18V4a1 1 0 0 0-1-1H5z" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" className={iconSize} aria-hidden="true">
          <path
            d="M5 3a1 1 0 0 0-1 1v14l6-3.5L16 18V4a1 1 0 0 0-1-1H5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            className="text-app-text-muted"
          />
        </svg>
      )}
    </button>
  );
}
