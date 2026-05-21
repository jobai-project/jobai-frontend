import { useParams } from 'react-router-dom';
import { useJobDetail } from '@/hooks/useJobDetail';
import BackButton from '@/components/common/BackButton';
import ScoreGauge from '@/components/common/ScoreGauge';
import { SOURCE_LABEL } from '@/types/job';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, isError, error } = useJobDetail(id);

  if (isLoading) {
    return (
      <div className="relative pt-12">
        <BackButton />
        <div className="h-[420px] animate-pulse rounded-xl border border-app-border bg-app-surface" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="relative pt-12">
        <BackButton />
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-app-border-strong bg-app-surface px-6 py-14 text-center text-app-text-subtle">
          <div className="text-4xl">⌕</div>
          <div className="text-base font-semibold text-app-text-muted">
            공고를 찾을 수 없습니다
          </div>
          <div className="text-[13px] text-app-text-subtle">
            {error?.message ?? '잠시 후 다시 시도해 주세요.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pt-12">
      <BackButton />

      <article className="rounded-xl border border-app-border bg-app-surface px-8 py-7">
        <div className="mb-6 flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="mb-2 text-[13px] text-app-text-muted">{job.company}</div>
            <h1 className="mb-3 text-2xl font-bold text-app-text">{job.title}</h1>
            <div className="text-sm text-app-text-muted">
              {job.location} · {job.employmentType} · {job.experience}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ScoreGauge score={job.score} />
            <span className="rounded-md border border-app-border bg-app-bg px-2.5 py-1 text-xs text-app-text-muted">
              {SOURCE_LABEL[job.source]}
            </span>
            <span className="text-base font-bold text-app-text">D-{job.dday}</span>
          </div>
        </div>

        <div className="mb-6 border-t border-app-border pt-6">
          <div className="mb-3 text-sm font-semibold text-app-text">기술 스택</div>
          <div className="flex flex-wrap gap-1.5">
            {job.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-app-border bg-app-bg px-2.5 py-1 text-xs text-app-text-muted"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6 border-t border-app-border pt-6">
          <div className="mb-3 text-sm font-semibold text-app-text">기업 유형</div>
          <span
            className={
              'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ' +
              (job.companyType === 'PUBLIC'
                ? 'border-app-border bg-app-bg text-app-text'
                : 'border-app-text bg-app-text text-white')
            }
          >
            {job.companyType === 'PUBLIC' ? '공기업' : '사기업'}
          </span>
        </div>

        <div className="border-t border-app-border pt-6 text-[13px] text-app-text-subtle">
          상세 설명은 백엔드 연동 후 제공됩니다.
        </div>
      </article>
    </div>
  );
}
