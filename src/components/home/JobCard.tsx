import { Link, useNavigate } from 'react-router-dom';
import BookmarkButton from '@/components/common/BookmarkButton';
import ScoreGauge from '@/components/common/ScoreGauge';
import type { JobSummary } from '@/types/jobApi';

interface JobCardProps {
  job: JobSummary;
  // 게스트 마스킹 모드 — 로그인 유도 툴팁 + 북마크 숨김 + Link 비활성 (spec §4.3·§4.4).
  // 점수 블러는 masked 와 별개로 matchScore === null 로 판정한다(로그인+이력서X 도 블러).
  masked?: boolean;
}

const CARD_CLASS =
  'relative flex h-full flex-col items-start gap-[16px] self-stretch rounded-2xl border border-app-border bg-app-surface px-[24px] py-[20px] text-left transition-all hover:border-app-border-strong hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-app-border-strong';

// 마스킹 카드 호버 시 노출되는 툴팁 (spec §4.4). 아래 방향 화살표로 점수를 가리킨다.
function GuestScoreTooltip() {
  const navigate = useNavigate();
  return (
    <div className="pointer-events-none absolute left-0 top-[-64px] z-20 flex opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100">
      <div className="relative inline-flex flex-col items-center justify-center rounded-lg border border-gray-800 bg-gray-800 px-4 py-3 shadow-[0_6px_12px_0_rgba(0,0,0,0.20)]">
        <span className="text-center font-pretendard text-[12px] font-normal leading-[130%] tracking-[-0.24px] text-white">
          로그인하면 점수를 확인할 수 있어요
        </span>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="text-center font-pretendard text-[12px] font-medium leading-[130%] tracking-[-0.24px] text-blue-300 underline decoration-solid [text-underline-position:from-font]"
        >
          로그인하기
        </button>
        {/* 아래 방향 화살표 — 동일 #303D4C(gray-800) CSS 삼각형 */}
        <span className="absolute left-6 top-full h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-gray-800" />
      </div>
    </div>
  );
}

export default function JobCard({ job, masked = false }: JobCardProps) {
  const jobId = String(job.id); // JobSummary.id 는 number — BookmarkButton/Link 는 string
  const noScore = job.matchScore === null; // 게스트 or 이력서 미업로드

  const inner = (
    <>
      {/* 게스트는 북마크 불가 → 마스킹 시 북마크 버튼 숨김 */}
      {!masked && (
        <BookmarkButton jobId={jobId} className="absolute right-[24px] top-[20px]" />
      )}

      <div className="w-full">
        <div className="relative mb-[8px] flex items-start">
          {noScore ? (
            // 점수 없음 → 블러 플레이스홀더. ScoreGauge 에 null/0 을 전달하지 않는다.
            // 게스트일 때만 로그인 유도 툴팁을 함께 노출.
            <div className="relative h-14 w-20 flex-shrink-0">
              <div
                aria-hidden
                className="pointer-events-none h-full w-full select-none rounded-md bg-gray-100 blur-[6px]"
              />
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-app-text-muted">
                ??점
              </span>
              {masked && <GuestScoreTooltip />}
            </div>
          ) : (
            <ScoreGauge score={job.matchScore as number} variant="semicircle" />
          )}
        </div>

        <h3 className="mb-[8px] line-clamp-2 min-h-[2.75rem] text-base font-bold leading-snug text-app-text">
          {job.title}
        </h3>

        <div className="mb-[16px] flex items-center gap-[8px]">
          <span className="truncate text-sm text-app-text-muted">{job.company}</span>
          {/* dDay null = 상시모집 */}
          <span className="flex-shrink-0 rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-bold text-red-500">
            {job.dDay === null ? '상시' : `D-${job.dDay}`}
          </span>
        </div>

        {/* techStack 은 목록 API 응답에 없어(A4) 목록 카드에서는 표시하지 않는다.
            (상세 API 에는 있을 수 있음 — 상세 연동 명세에서 처리) */}
        <div className="flex flex-wrap items-center gap-[8px]">
          <span className="truncate text-xs text-app-text-muted">
            {job.location} · {job.employmentType}
          </span>
        </div>
      </div>
    </>
  );

  // 마스킹 카드는 <Link> 대신 <div> — 내부 '로그인하기' 버튼과 anchor 중첩 방지.
  if (masked) {
    return <div className={`${CARD_CLASS} group cursor-default`}>{inner}</div>;
  }

  return (
    <Link to={`/jobs/${jobId}`} className={CARD_CLASS}>
      {inner}
    </Link>
  );
}
