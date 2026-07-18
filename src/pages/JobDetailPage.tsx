import { Link, useParams } from 'react-router-dom';
import { useJobDetail } from '@/hooks/useJobDetail';
import { useJobSummary } from '@/hooks/useJobSummary';
import BackButton from '@/components/common/BackButton';
import BookmarkButton from '@/components/common/BookmarkButton';
import JobInfo from '@/components/job_detail/JobInfo';
import ScoreBox from '@/components/job_detail/ScoreBox';
import JobSummarySection from '@/components/job_detail/JobSummarySection';
import DetailContent from '@/components/job_detail/DetailContent';
import type { CompanyType } from '@/types/job';

// URL 직접 접근으로 잘못된 source 가 올 수 있으므로 PUBLIC/PRIVATE 만 허용.
const toSource = (v: string | undefined): CompanyType | undefined =>
  v === 'PUBLIC' || v === 'PRIVATE' ? v : undefined;

export default function JobDetailPage() {
  const { source, id } = useParams<{ source: string; id: string }>();
  const jobSource = toSource(source);
  const jobId = Number(id);

  const { data: job, isLoading, isError, error } = useJobDetail(jobSource, jobId);

  // AI 요약 완료 여부 — JobSummarySection 과 동일 queryKey(['jobSummary', jobId]) 캐시 공유.
  // enabled:false 라 여기서 요청은 안 하고, 섹션의 refetch 가 채운 캐시만 읽는다.
  // 완료 시 원문 본문(DetailContent)을 언마운트한다(§6 확정).
  const { data: summary } = useJobSummary(jobId);
  const summaryDone = !!summary;

  // 게이지 점수·근거 — 상세 응답(PRIVATE·PUBLIC 공통) 한 곳에서 읽는다. null = 미산출 → "??" 블러.
  // (guard 이전이라 job 이 undefined 일 수 있어 옵셔널 체이닝 + ?? null)
  const matchScore = job?.matchScore ?? null;
  const scoreReason = job?.scoreReason ?? null;

  // 잘못된 source(예: /jobs/XXX/1) 는 요청하지 않고 바로 404.
  const invalid = !jobSource || !Number.isFinite(jobId);

  if (!invalid && isLoading) {
    return (
      <div className="relative">
        <BackButton variant="pill" label="목록으로" />
        <div className="h-[420px] animate-pulse rounded-xl border border-app-border bg-app-surface" />
      </div>
    );
  }

  if (invalid || isError || !job) {
    return (
      <div className="relative">
        <BackButton variant="pill" label="목록으로" />
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-app-border-strong bg-app-surface px-6 py-14 text-center text-app-text-subtle">
          <div className="text-4xl">⌕</div>
          <div className="text-base font-semibold text-app-text-muted">
            공고를 찾을 수 없습니다
          </div>
          <div className="text-[13px] text-app-text-subtle">
            {invalid
              ? '잘못된 주소예요.'
              : (error?.message ?? '잠시 후 다시 시도해 주세요.')}
          </div>
          {/* 인증 만료(비인증 시 public 은 302) 대비 — 빈 화면 방치 대신 로그인 경로 제공 */}
          <Link
            to="/login"
            className="mt-1 text-[13px] font-medium text-app-primary underline"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* P3 상단바(Figma 1576:12770) — bg-gray-50 + 전체폭. MainLayout main p-40 를 음수 margin 으로 탈출.
          ❓ TODO(P3): Figma drop-shadow 값 미추출 → shadow 생략. 확정 후 추가. */}
      <div className="-mx-[40px] -mt-[40px] flex items-center justify-between bg-gray-50 px-[40px] pb-[20px] pt-[40px]">
        <BackButton variant="pill" label="목록으로" />

        {/* A-2 사이트 바로가기 → applyUrl (없으면 비활성). bg-app-primary(=#4741FF), rounded-full, h-46, 18px */}
        {job.applyUrl ? (
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[46px] items-center gap-2 rounded-full bg-app-primary px-6 text-[18px] font-semibold text-white transition-colors hover:opacity-90"
          >
            사이트 바로가기
            {/* ❓ TODO(B5): Figma C05 아이콘(24px) 미추출 → 기존 arrow-right 유지 */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-white">
              <path
                d="M14.25 9H3.75M14.25 9L10.5 5.25M14.25 9L10.5 12.75"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="flex h-[46px] items-center gap-2 rounded-full bg-app-border px-6 text-[18px] font-semibold text-app-text-muted"
          >
            지원 링크 없음
          </button>
        )}
      </div>

      {/* P1 상단 2컬럼 영역(Figma 1428:14118) — pt-52, gap-32. pb-64는 하단영역 좌컬럼 이동에 따라 승계 */}
      <div className="flex flex-col gap-[32px] pt-[52px] pb-[64px]">
        {/* 제목행(1428:14119) — 32 Bold + 북마크 36px */}
        <div className="flex items-center gap-[20px]">
          <h1 className="text-[32px] font-bold tracking-[-0.64px] text-black">{job.title}</h1>
          <BookmarkButton source={job.source} sourceId={job.id} size="lg" />
        </div>

        {/* 2컬럼(1428:14122) — 좌 공고정보+본문 716 / 우 AI 점수 348 sticky. 고정 gap 아님(justify-between) */}
        <div className="flex flex-wrap items-start justify-between gap-y-[20px]">
          {/* 좌컬럼 — JobInfo + 하단영역(요약/본문/부가필드). gap-52 = 기존 정보섹션 pb-52 승계 */}
          <div className="flex w-[716px] flex-col gap-[52px]">
            <JobInfo job={job} />

            {/* P6 하단 — AI 요약 + 원문 본문(Figma 1428:14195) gap-40. 좌컬럼 자식으로 이동해 폭 716 상속. */}
            <div className="flex flex-col gap-[40px]">
              {/* AI 요약(온디맨드) — 사기업 전용. 본문과 독립(버튼 클릭 전 호출 없음). */}
              {job.source === 'PRIVATE' && <JobSummarySection jobId={job.id} />}

              {/* 원문 본문 — content(디코드+sanitize). §6: AI 요약 완료 시 언마운트(탭+섹션으로 대체). */}
              {!summaryDone && <DetailContent content={job.content} />}

              {/* 공공 전용 부가 필드 — 값 있을 때만 조건부 렌더 */}
              {job.source === 'PUBLIC' && (
                <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 text-sm">
                  {job.workExperience && (
                    <>
                      <dt className="text-app-text-muted">경력</dt>
                      <dd className="text-app-text font-medium">{job.workExperience}</dd>
                    </>
                  )}
                  {job.applyQualification && (
                    <>
                      <dt className="text-app-text-muted">지원자격</dt>
                      <dd className="text-app-text font-medium">{job.applyQualification}</dd>
                    </>
                  )}
                  {job.applicationMethod && (
                    <>
                      <dt className="text-app-text-muted">지원방법</dt>
                      <dd className="text-app-text font-medium">{job.applicationMethod}</dd>
                    </>
                  )}
                  {job.disqualificationReason && (
                    <>
                      <dt className="text-app-text-muted">결격사유</dt>
                      <dd className="text-app-text font-medium">{job.disqualificationReason}</dd>
                    </>
                  )}
                </dl>
              )}
            </div>
          </div>

          {/* 점수영역 — sticky. self-start로 세로 stretch 방지(sticky 성립 조건). top-52 = 감사 확정값 */}
          <div className="w-[348px] self-start sticky top-[52px]">
            <ScoreBox score={matchScore} reason={scoreReason} />
          </div>
        </div>
      </div>
    </div>
  );
}
