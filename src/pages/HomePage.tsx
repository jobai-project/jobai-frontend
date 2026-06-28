import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteJobs } from '@/hooks/useInfiniteJobs';
import { useConditionStore } from '@/stores/conditionStore';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { parseCompanyType } from '@/types/job';
import WelcomeCard from '@/components/home/WelcomeCard';
import DeadlineCard, { type DeadlineItem } from '@/components/home/DeadlineCard';
import AINewsCard from '@/components/home/AINewsCard';
import TrendingScrap, {
  type TrendingScrapItem,
} from '@/components/home/TrendingScrap';
import FilterBar from '@/components/home/FilterBar';
import JobList from '@/components/home/JobList';
import NoResults from '@/components/home/NoResults';
import { mockJobs } from '@/data/mockJobs';
import { mockAINews } from '@/data/mockNews';
import TopBar from '@/components/layout/TopBar';

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

  // 검색 중에는 개인 맞춤 조건을 끄고 검색 결과를 우선한다.
  const condition = useConditionStore((s) => s.condition);
  const { data, isLoading, isError } = useInfiniteJobs({
    companyType,
    q,
    condition: isSearching ? null : condition,
  });
  const jobs = data?.pages.flatMap((page) => page.jobs) ?? [];

  // "곧 마감되는 스크랩 공고" 카드는 실제 스크랩(북마크)된 공고만 노출한다.
  // TODO(API 연동): 북마크 store 대신 실제 스크랩 목록 API로 교체.
  const bookmarkedIds = useBookmarkStore((s) => s.bookmarkedIds);
  const deadlineItems = useMemo<DeadlineItem[]>(
    () =>
      mockJobs
        .filter((j) => bookmarkedIds.has(j.id))
        .sort((a, b) => a.dday - b.dday)
        .slice(0, 3)
        .map((j) => ({
          id: j.id,
          title: j.title,
          company: j.company,
          dDay: j.dday,
          expiresAt: formatExpiresAt(j.dday),
        })),
    [bookmarkedIds]
  );

  const trendingItems = useMemo<TrendingScrapItem[]>(
    () =>
      [...mockJobs]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((j, i) => ({
          id: j.id,
          rank: i + 1,
          title: j.title,
          company: j.company,
        })),
    []
  );

  return (
    <>
      <TopBar />
      
      {!isSearching && <TrendingScrap items={trendingItems} />}

      {!isSearching && (
        <section className="mb-9 grid grid-cols-[1fr_348px_256px] gap-[20px]">
          <WelcomeCard />
          <DeadlineCard jobs={deadlineItems} />
          <AINewsCard news={mockAINews} />
        </section>
      )}

      {!isSearching && (
        <div id="recommended-jobs" className="mb-4 flex scroll-mt-6 items-center gap-2">
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
        <section className="w-full max-w-[1164px]">
          <JobList jobs={jobs} />
        </section>
      )}
    </>
  );
}
