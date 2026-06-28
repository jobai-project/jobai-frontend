export interface EmptyScrapProps {
  /** 버튼 클릭 시 실행할 동작 (재사용을 위해 주입). 없으면 버튼 비활성 동작 */
  onAction?: () => void;
  /** 빈 상태 안내 문구 (기본: "아직 스크랩한 공고가 없어요") */
  title?: string;
  /** 버튼 라벨 (기본: "스크랩 하러 가기") */
  actionLabel?: string;
  /** 외부 레이아웃 보정용 클래스 */
  className?: string;
}

/**
 * 스크랩한 공고가 0건일 때 표시하는 공통 빈 상태 컴포넌트.
 * 버튼 동작은 onAction으로 주입받아 홈 카드 / 스크랩 페이지 등에서 재사용한다.
 */
export default function EmptyScrap({
  onAction,
  title = '아직 스크랩한 공고가 없어요',
  actionLabel = '스크랩 하러 가기',
  className = '',
}: EmptyScrapProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {/* 장식용 일러스트이므로 alt는 비우고 aria-hidden 처리 */}
      <img
        src="/noscrap.svg"
        alt=""
        aria-hidden="true"
        className="mb-3 h-16 w-16 select-none"
      />

      <p className="mb-4 text-sm text-app-text-subtle">{title}</p>

      <button
        type="button"
        onClick={onAction}
        className="inline-flex h-[41px] w-[126px] items-center justify-center rounded-lg px-[18px] py-[12px] text-sm font-medium text-purple-500 transition-colors bg-purple-50 hover:bg-purple-100"
      >
        {actionLabel}
      </button>
    </div>
  );
}
