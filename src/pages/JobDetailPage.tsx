import { useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useJobDetail } from '@/hooks/useJobDetail';
import BackButton from '@/components/common/BackButton';
import BookmarkButton from '@/components/common/BookmarkButton';
import JobInfo from '@/components/job_detail/JobInfo';
import TabNavigation from '@/components/job_detail/TabNavigation';
import ScoreBox from '@/components/job_detail/ScoreBox';
import DetailContent from '@/components/job_detail/DetailContent';
import RequirementTab from '@/components/job_detail/RequirementTab';

type TabType = 'detail' | 'qualification';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, isError, error } = useJobDetail(id);
  const [activeTab, setActiveTab] = useState<TabType>('detail');

  const tabContent = useMemo(() => {
    if (!job) return null;

    return activeTab === 'detail' ? (
      <DetailContent job={job} />
    ) : (
      <RequirementTab />
    );
  }, [activeTab, job]);

  if (isLoading) {
    return (
      <div className="relative">
        <BackButton />
        <div className="h-[420px] animate-pulse rounded-xl border border-app-border bg-app-surface" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="relative">
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
    <div className="relative">
      <div className="mb-4 flex items-center justify-between">
        <BackButton />
        {/* <button
          type="button"
          className="flex items-center gap-1.5 rounded-full bg-app-primary-soft px-4 py-2 text-sm font-semibold text-app-primary transition-colors hover:opacity-80"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L4 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          목록으로
        </button> */}

        <button
          type="button"
          className="flex items-center gap-2 rounded-full bg-app-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
          aria-label="지원하기"
        >
          지원하기
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-white">
            <path
              d="M14.25 9H3.75M14.25 9L10.5 5.25M14.25 9L10.5 12.75"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-[1fr_348px] gap-10 items-start mt-6">
          <div className="min-w-0 flex-1">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <h1 className="text-2xl font-bold text-app-text">{job.title}</h1>
                <BookmarkButton jobId={job.id} />
              </div>

              <JobInfo job={job} />
            </div>

            <div className="mt-6">
              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <div className="w-full py-6">
              {tabContent}
            </div>
          </div>

        <div className="w-[348px] flex-shrink-0">
          <div className="right-[calc((100vw-1400px)/2)] top-1/3 translate-y-5 w-[348px] z-50">
            <ScoreBox score={job.score} />
          </div>
        </div>
      </div>
    </div>
  );
}