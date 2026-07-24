import { useParams } from 'react-router-dom';
import SearchResultRow from '@/components/search/SearchResultRow';
import { useNotificationMatches } from '@/hooks/useNotifications';
import type { JobSummary } from '@/types/jobApi';

// 알림(매칭 배치)에 포함된 공고들을 검색 결과와 동일한 SearchResultRow(세로 리스트)로
// 보여준다. 각 행 클릭 시 SearchResultRow 자체에 내장된 <Link to={`/jobs/${source}/${id}`}>
// 덕분에 별도 처리 없이 공고 상세로 이동한다. 사이드바는 MainLayout이 그대로 유지해주고,
// 이 페이지는 검색창/우측 카드 없이 목록만 그린다.
export default function NotificationMatchesPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const parsedBatchId = batchId ? Number(batchId) : undefined;

  const { data, isLoading, isError } = useNotificationMatches(parsedBatchId);

  if (isLoading) {
    return (
      <div className="pt-12">
        <div className="mb-6 h-6 w-40 animate-pulse rounded bg-[#F2F4F6]" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[140px] rounded-lg bg-[#F2F4F6] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="pt-12 text-sm text-app-text-muted">
        알림 내역을 불러오지 못했어요.
      </div>
    );
  }

  // SearchResultRow가 기대하는 JobSummary 형태로 매핑 (필드명 companyName → company만 다름)
  const jobSummaries: JobSummary[] = data.jobs.map((job) => ({
    id: job.id,
    source: job.source,
    company: job.companyName,
    title: job.title,
    matchScore: job.matchScore,
    dDay: job.dDay,
    location: job.location,
    employmentType: job.employmentType,
    jobCategory: job.jobCategory ?? null,
  }));

  return (
    <div className="pt-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-app-text">새로 매칭된 공고</h1>
        <p className="text-sm text-app-text-muted mt-1">
          {data.count}건의 공고가 매칭됐어요.
        </p>
      </div>

      {jobSummaries.length === 0 ? (
        <div className="text-sm text-app-text-muted">표시할 공고가 없어요.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {jobSummaries.map((job) => (
            <SearchResultRow key={`${job.source}-${job.id}`} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}