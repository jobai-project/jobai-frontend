import { Link, useNavigate } from 'react-router-dom';
import BookmarkButton from '@/components/common/BookmarkButton';
import ScoreGauge from '@/components/common/ScoreGauge';
import type { JobSummary } from '@/types/jobApi';
import { toScrapKey, type Scrap } from '@/types/scrap';

interface JobCardProps {
  job: JobSummary;
  // 게스트 마스킹 모드 — 로그인 유도 툴팁 + 북마크 숨김 + Link 비활성 (spec §4.3·§4.4).
  // 점수 블러는 masked 와 별개로 matchScore === null 로 판정한다(로그인+이력서X 도 블러).
  masked?: boolean;
}

// GC-1: rounded-[14px], gap-8, border-blue-100, shadow-guestcard.
const CARD_CLASS =
  'relative flex h-full flex-col items-start gap-[8px] self-stretch rounded-[14px] border border-blue-100 bg-app-surface px-[24px] py-[20px] text-left shadow-guestcard transition-all hover:shadow-guestcard focus:outline-none focus:ring-2 focus:ring-app-border-strong';

// 마스킹 카드 호버 시 노출되는 툴팁 (spec §4.4). 아래 방향 화살표로 점수를 가리킨다.
function GuestScoreTooltip() {
  const navigate = useNavigate();
  return (
    <div className="pointer-events-none absolute left-1/2 top-[-64px] z-20 flex -translate-x-1/2 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100">
      <div className="relative inline-flex items-start justify-center gap-[8px] whitespace-nowrap rounded-base border border-gray-800 bg-gray-800 px-4 py-3 shadow-[0_6px_6px_0_rgba(0,0,0,0.20)]">
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
        {/* 아래 방향 화살표 — 동일 #303D4C(gray-800) CSS 삼각형. 하단 중앙(게이지 조준) */}
        <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-gray-800" />
      </div>
    </div>
  );
}

export default function JobCard({ job, masked = false }: JobCardProps) {
  const jobId = String(job.id); // Link 는 string 경로 필요
  const noScore = job.matchScore === null; // 게스트 or 이력서 미업로드
  // 스크랩 추가 시 목록에 낙관적으로 넣을 데이터(onSettled invalidate가 서버값으로 정정).
  const scrapOptimistic: Scrap = {
    key: toScrapKey(job.source, job.id),
    source: job.source,
    sourceId: job.id,
    companyName: job.company,
    title: job.title,
    location: job.location,
    employmentType: job.employmentType,
    matchScore: job.matchScore,
    dDay: job.dDay,
    deadline: null,
    scrappedAt: new Date().toISOString(),
  };

  const inner = (
    <>
      {/* 게스트는 북마크 불가 → 마스킹 시 북마크 버튼 숨김 */}
      {!masked && (
        <BookmarkButton
          source={job.source}
          sourceId={job.id}
          optimistic={scrapOptimistic}
          className="absolute right-[24px] top-[20px]"
        />
      )}

      {/* GC-2 상단 행 — 점수 그룹(북마크는 masked 시 숨김·absolute) */}
      <div className="flex w-full items-start justify-between">
        {noScore ? (
          // 점수 없음 → 블러 게이지 플레이스홀더(GC-3). 게이지 그룹 93×47.84 근사 +
          // "??" 24 SemiBold + "점" 16 Regular. 게스트일 때만 로그인 유도 툴팁 노출.
          <div className="relative h-12 w-[93px] flex-shrink-0">
            <svg viewBox="0 0 93 48" aria-hidden className="h-full w-full blur-[3px]">
              <defs>
                <linearGradient id="guest-gauge" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#A78BFA" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
              <path d="M 8 44 A 38 38 0 0 1 85 44" fill="none" stroke="#E6E8EB" strokeWidth="6" strokeLinecap="round" />
              <path
                d="M 8 44 A 38 38 0 0 1 85 44"
                fill="none"
                stroke="url(#guest-gauge)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="120"
                strokeDashoffset="55"
              />
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex items-baseline justify-center">
              <span className="text-[24px] font-semibold tracking-[-0.48px] text-gray-900">??</span>
              <span className="ml-0.5 text-[16px] font-normal text-gray-900">점</span>
            </div>
            {masked && <GuestScoreTooltip />}
          </div>
        ) : (
          <ScoreGauge score={job.matchScore as number} variant="semicircle" />
        )}
      </div>

      {/* GC-5 본문 — flex-col gap-16 */}
      <div className="flex w-full flex-col gap-4">
        {/* GC-6 텍스트 블록 — gap-4 */}
        <div className="flex flex-col gap-1">
          {/* GC-7 공고명 — 18 Medium/150%/-0.36px/gray-900 */}
          <h3 className="line-clamp-2 text-[18px] font-medium leading-[1.5] tracking-[-0.36px] text-gray-900">
            {job.title}
          </h3>
          <div className="flex items-center gap-2">
            {/* GC-8 회사명 — 14 Regular/gray-800 */}
            <span className="truncate text-[14px] text-gray-800">{job.company}</span>
            {/* GC-9 D-day — 텍스트만(배경필 제거), 14 Medium/error-base. dDay null = 상시모집 */}
            <span className="flex-shrink-0 text-[14px] font-medium text-error-base">
              {job.dDay === null ? '상시' : `D-${job.dDay}`}
            </span>
          </div>
        </div>

        {/* GC-10 배지 행(opacity-80). GC-11 techStack 배지는 목록 API 미제공으로 보류(§9-2) →
            대신 location·employmentType 텍스트 유지. */}
        <div className="flex flex-wrap items-center gap-[8px] opacity-80">
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
    // 상세는 matchScore 를 API 로 못 얻는다(상세 응답에 없음) → 목록 점수를 state 로 전달.
    // JobCard 는 목록·검색·스크랩 공용이라 matchScore 없는 화면 대비 ?? null.
    <Link
      to={`/jobs/${job.source}/${jobId}`}
      state={{ matchScore: job.matchScore ?? null }}
      className={CARD_CLASS}
    >
      {inner}
    </Link>
  );
}
