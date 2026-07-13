import { useBookmarkStore, useIsBookmarked } from '@/stores/bookmarkStore';
import { useToastStore } from '@/stores/toastStore';

interface BookmarkButtonProps {
  jobId: string;
  className?: string;
  // 'lg' = 상세 페이지(아이콘 36px/버튼 44px). 기본은 기존 카드용(20/32) — 다른 사용처 영향 없음.
  size?: 'default' | 'lg';
}

export default function BookmarkButton({
  jobId,
  className = '',
  size = 'default',
}: BookmarkButtonProps) {
  const btnSize = size === 'lg' ? 'h-11 w-11' : 'h-8 w-8'; // 44 vs 32
  const iconSize = size === 'lg' ? 'h-9 w-9' : 'h-5 w-5'; // 36 vs 20
  const isBookmarked = useIsBookmarked(jobId);
  const toggle = useBookmarkStore((s) => s.toggle);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const willAdd = !isBookmarked; // 토글 전 상태로 추가/해제 판별
    toggle(jobId);
    // 추가할 때만 토스트 노출 (해제 시에는 띄우지 않음 — 확정 사항)
    if (willAdd) {
      // TODO(문구 첫 글자 확인 필요): 이미지 가림으로 '선택한…' 잠정 확정 (Figma 텍스트 레이어 확인)
      useToastStore.getState().showToast('선택한 공고를 스크랩 목록에 추가했어요');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isBookmarked ? '스크랩 취소' : '스크랩'}
      aria-pressed={isBookmarked}
      className={`inline-flex ${btnSize} items-center justify-center rounded-full text-lg transition hover:bg-app-hover ${className}`}
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
        <svg
          viewBox="0 0 20 20"
          className={iconSize}
          aria-hidden="true"
        >
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
