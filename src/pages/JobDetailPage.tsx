import { Link, useParams } from 'react-router-dom';
import { useJobDetail } from '@/hooks/useJobDetail';
import { useJobSummary } from '@/hooks/useJobSummary';
import BackButton from '@/components/common/BackButton';
import BookmarkButton from '@/components/common/BookmarkButton';
import JobInfo from '@/components/job_detail/JobInfo';
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
    <div className="relative">
      <div className="mb-4 flex items-center justify-between">
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
            {/* ❓ Figma 화살표 아이콘 정체 미확인 → 기존 arrow-right 유지 */}
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

      <div className="mt-6">
        <div className="min-w-0">
          <div className="mb-5 flex items-center gap-3">
            {/* A-1 공고 제목 — 32 Bold, tracking -0.64, #000 (text-app-text #172129 → text-black) */}
            <h1 className="text-[32px] font-bold tracking-[-0.64px] text-black">{job.title}</h1>
            {/* A-1 북마크 — 아이콘 36px(size=lg) */}
            <BookmarkButton source={job.source} sourceId={job.id} size="lg" />
          </div>

          <JobInfo job={job} />

          {/* AI 요약(온디맨드) — 사기업 전용. 본문과 독립(버튼 클릭 전 호출 없음). */}
          {job.source === 'PRIVATE' && (
            <div className="mt-[52px]">
              <JobSummarySection jobId={job.id} />
            </div>
          )}

          {/* 원문 본문 — content(디코드+sanitize). §6: AI 요약 완료 시 언마운트(탭+섹션으로 대체). */}
          {!summaryDone && (
            <div className="w-full py-6">
              <DetailContent content={job.content} />
            </div>
          )}

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
    </div>
  );
}
