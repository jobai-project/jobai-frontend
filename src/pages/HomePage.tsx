import { useSearchParams } from 'react-router-dom';
import { useInfiniteJobs } from '@/hooks/useInfiniteJobs';
import { parseCompanyType } from '@/types/job';
import SummaryRow from '@/components/home/SummaryRow';
import FilterBar from '@/components/home/FilterBar';
import JobList from '@/components/home/JobList';
import NoResults from '@/components/home/NoResults';

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const companyType = parseCompanyType(searchParams.get('companyType'));
  const q = searchParams.get('q')?.trim() ?? '';
  const isSearching = q.length > 0;

  const { data, isLoading, isError } = useInfiniteJobs({ companyType, q });
  const jobs = data?.pages.flatMap((page) => page.jobs) ?? [];

  return (
    <>
      {!isSearching && <SummaryRow />}

      {!isSearching && (
        <div className="mb-4 flex items-center gap-2">
          <div className="text-base font-bold text-app-text">✨ 나에게 딱 맞는 공고</div>
        </div>
      )}

      {isSearching && (
        <div className="mb-4 flex items-center gap-2">
          <div className="text-base font-bold text-app-text">
            "{q}" 검색 결과
          </div>
        </div>
      )}

      {!isSearching && <FilterBar />}

      {isError ? (
        <NoResults
          title="공고를 불러오지 못했습니다"
          description="잠시 후 다시 시도해 주세요."
        />
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[124px] animate-pulse rounded-xl border border-app-border bg-app-surface"
            />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <NoResults query={isSearching ? q : undefined} />
      ) : (
        <JobList jobs={jobs} />
      )}
    </>
  );
}
