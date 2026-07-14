import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteJobs } from '@/hooks/useInfiniteJobs';
import { useRecommendedJobs } from '@/hooks/useInfiniteJobList';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { useAuthStore } from '@/stores/authStore';
import { parseCompanyType, type Job } from '@/types/job';
import type { JobSummary } from '@/types/jobApi';
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
import TopBar from '@/components/layout/TopBar';
import Footer from '@/components/layout/Footer';

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

// 섹션 타이틀용 ai 아이콘 (size-24, §6 E). mingcute:ai-fill 근사.
function AiIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12 2.5c.4 0 .74.27.85.65l.9 3.14a4 4 0 0 0 2.76 2.76l3.14.9a.9.9 0 0 1 0 1.72l-3.14.9a4 4 0 0 0-2.76 2.76l-.9 3.14a.9.9 0 0 1-1.72 0l-.9-3.14a4 4 0 0 0-2.76-2.76l-3.14-.9a.9.9 0 0 1 0-1.72l3.14-.9a4 4 0 0 0 2.76-2.76l.9-3.14A.9.9 0 0 1 12 2.5Z"
      />
      <path fill="currentColor" d="M19 3.5c.16 0 .3.1.35.26l.38 1.25 1.25.38a.37.37 0 0 1 0 .7l-1.25.38-.38 1.25a.37.37 0 0 1-.7 0l-.38-1.25-1.25-.38a.37.37 0 0 1 0-.7l1.25-.38.38-1.25A.37.37 0 0 1 19 3.5Z" />
    </svg>
  );
}

function formatExpiresAt(dday: number): string {
  const target = new Date();
  target.setDate(target.getDate() + dday);
  const mm = String(target.getMonth() + 1).padStart(2, '0');
  const dd = String(target.getDate()).padStart(2, '0');
  return `${mm}. ${dd} (${WEEKDAY_KO[target.getDay()]})`;
}

// 검색(q) 경로의 mock Job → JobSummary 임시 브릿지. 검색 API 연동(후속 명세) 시 제거.
const mockJobToSummary = (j: Job): JobSummary => ({
  id: Number(j.id),
  source: j.companyType,
  company: j.company,
  title: j.title,
  matchScore: j.score,
  dDay: j.dday,
  location: j.location,
  employmentType: j.employmentType,
});

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const companyType = parseCompanyType(searchParams.get('companyType'));
  const q = searchParams.get('q')?.trim() ?? '';
  const isSearching = q.length > 0;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // 섹션 개인화 이름 — 히어로 인사말과 동일 소스(authStore.user.name) 재사용(§9-2).
  const name = useAuthStore((s) => s.user?.name);

  // 기본 목록(비검색) → recommended-jobs API. 개인화(희망직무/지역)는 서버가 처리.
  const locations = searchParams.getAll('location');
  const employmentTypes = searchParams.getAll('employmentType');
  const filters = {
    companyTypes: companyType ? [companyType] : undefined,
    locations: locations.length ? locations : undefined,
    employmentTypes: employmentTypes.length ? employmentTypes : undefined,
  };
  const recommended = useRecommendedJobs(filters, isAuthenticated && !isSearching);

  // 검색(q) 경로는 별도 명세 범위 밖 → 기존 mock 훅을 임시 유지(q 없을 땐 결과 미사용).
  const search = useInfiniteJobs({ companyType, q, condition: null });

  // 표시 목록: 검색 결과(mock Job)는 카드가 요구하는 JobSummary 로 임시 브릿지 변환.
  const jobs: JobSummary[] = isSearching
    ? (search.data?.pages.flatMap((p) => p.jobs) ?? []).map(mockJobToSummary)
    : (recommended.data?.pages.flatMap((p) => p.jobs) ?? []);

  const active = isSearching ? search : recommended;
  const { isLoading, isError } = active;

  const loadMoreRef = useInfiniteScroll(() => {
    if (active.hasNextPage && !active.isFetchingNextPage) active.fetchNextPage();
  }, !!active.hasNextPage);

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

      {/* A. 히어로(440) + 카드 2개(302×306) — flex gap-20 items-center (bg-gray-50·패딩은 MainLayout) */}
      {!isSearching && (
        <section className="mb-9 flex items-center gap-5">
          <WelcomeCard />
          <DeadlineCard jobs={deadlineItems} />
          <AINewsCard />
        </section>
      )}

      {/* E. 섹션 타이틀 — ai아이콘24 + 20 SemiBold/-0.4px, 개인화 이름 */}
      {!isSearching && (
        <div id="recommended-jobs" className="mb-4 flex scroll-mt-6 items-center gap-3">
          <AiIcon className="h-6 w-6 flex-shrink-0 text-app-primary" />
          <h2 className="font-pretendard text-[20px] font-semibold leading-[140%] tracking-[-0.4px] text-black">
            {name ?? '회원'} 님에게 딱 맞는 공고
          </h2>
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
          <div ref={loadMoreRef} className="h-8" />
        </section>
      )}

      {/* 홈 전용 푸터 (Footer.spec §6 — 홈에서만) */}
      <Footer />
    </>
  );
}
