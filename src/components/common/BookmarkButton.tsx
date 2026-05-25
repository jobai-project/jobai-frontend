import { useBookmarkStore, useIsBookmarked } from '@/stores/bookmarkStore';

interface BookmarkButtonProps {
  jobId: string;
  className?: string;
}

export default function BookmarkButton({ jobId, className = '' }: BookmarkButtonProps) {
  const isBookmarked = useIsBookmarked(jobId);
  const toggle = useBookmarkStore((s) => s.toggle);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggle(jobId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isBookmarked ? '스크랩 취소' : '스크랩'}
      aria-pressed={isBookmarked}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-lg transition hover:bg-app-hover ${className}`}
    >
      {isBookmarked ? (
        <svg
          viewBox="0 0 20 20"
          className="h-5 w-5 fill-blue-600"
          aria-hidden="true"
        >
          <path d="M5 3a1 1 0 0 0-1 1v14l6-3.5L16 18V4a1 1 0 0 0-1-1H5z" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 20 20"
          className="h-5 w-5"
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
