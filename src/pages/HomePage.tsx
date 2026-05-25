import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteJobs } from '@/hooks/useInfiniteJobs';
import { parseCompanyType } from '@/types/job';
import WelcomeCard from '@/components/home/WelcomeCard';
import DeadlineCard, { type DeadlineItem } from '@/components/home/DeadlineCard';
import AINewsCard from '@/components/home/AINewsCard';
import FilterBar from '@/components/home/FilterBar';
import JobList from '@/components/home/JobList';
import NoResults from '@/components/home/NoResults';
import { mockJobs } from '@/data/mockJobs';
import { mockAINews } from '@/data/mockNews';

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

function formatExpiresAt(dday: number): string {
  const target = new Date();
  target.setDate(target.getDate() + dday);
  const mm = String(target.getMonth() + 1).padStart(2, '0');
  const dd = String(target.getDate()).padStart(2, '0');
  return `${mm}. ${dd} (${WEEKDAY_KO[target.getDay()]})`;
}

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const companyType = parseCompanyType(searchParams.get('companyType'));
  const q = searchParams.get('q')?.trim() ?? '';
  const isSearching = q.length > 0;

  const { data, isLoading, isError } = useInfiniteJobs({ companyType, q });
  const jobs = data?.pages.flatMap((page) => page.jobs) ?? [];

  const deadlineItems = useMemo<DeadlineItem[]>(
    () =>
      [...mockJobs]
        .sort((a, b) => a.dday - b.dday)
        .slice(0, 3)
        .map((j) => ({
          id: j.id,
          title: j.title,
          company: j.company,
          dDay: j.dday,
          expiresAt: formatExpiresAt(j.dday),
        })),
    []
  );

  return (
    <>
      {!isSearching && (
        <section className="mb-9 grid grid-cols-3 gap-4">
          <WelcomeCard />
          <DeadlineCard jobs={deadlineItems} />
          <AINewsCard news={mockAINews} />
        </section>
      )}

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
