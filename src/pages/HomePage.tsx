import { useSearchParams } from 'react-router-dom';
import { useJobSearch } from '@/hooks/useJobSearch';
import { useRecommendedJobs } from '@/hooks/useInfiniteJobList';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useAuthStore } from '@/stores/authStore';
import { parseCompanyType, type CompanyType } from '@/types/job';
import type { JobSummary } from '@/types/jobApi';
import WelcomeCard from '@/components/home/WelcomeCard';
import DeadlineCard from '@/components/home/DeadlineCard';
import AINewsCard from '@/components/home/AINewsCard';
import TrendingScrap from '@/components/home/TrendingScrap';
import FilterBar from '@/components/home/FilterBar';
import JobList from '@/components/home/JobList';
import SearchResultList from '@/components/search/SearchResultList';
import NoResults from '@/components/home/NoResults';
import { useScrapRankings } from '@/hooks/useScrapRankings';
import TopBar from '@/components/layout/TopBar';
import Footer from '@/components/layout/Footer';

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

export default function HomePage() {
  const [searchParams] = useSearchParams();
  // 기업형태 다중: 반복 쿼리(companyType=A&companyType=B) → 유효값만 + 중복 제거.
  const companyTypes = [
    ...new Set(
      searchParams
        .getAll('companyType')
        .map(parseCompanyType)
        .filter((c): c is CompanyType => c !== undefined),
    ),
  ];
  const q = searchParams.get('q')?.trim() ?? '';
  const isSearching = q.length > 0;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // 섹션 개인화 이름 — 히어로 인사말과 동일 소스(authStore.user.name) 재사용(§9-2).
  const name = useAuthStore((s) => s.user?.name);

  // 기본 목록(비검색) → recommended-jobs API. 개인화(희망직무/지역)는 서버가 처리.
  const locations = searchParams.getAll('location');
  const employmentTypes = searchParams.getAll('employmentType');
  const filters = {
    companyTypes: companyTypes.length ? companyTypes : undefined,
    locations: locations.length ? locations : undefined,
    employmentTypes: employmentTypes.length ? employmentTypes : undefined,
  };
  const recommended = useRecommendedJobs(filters, isAuthenticated && !isSearching);

  // 검색(q) → 자연어 검색 API. q 를 query 로 전달, 검색 중일 때만 실행.
  const search = useJobSearch(q, isSearching);

  // 검색/추천 모두 JobSummary 로 정규화되어 동일 JobCard 로 렌더.
  const jobs: JobSummary[] = isSearching
    ? (search.data?.pages.flatMap((p) => p.jobs) ?? [])
    : (recommended.data?.pages.flatMap((p) => p.jobs) ?? []);

  const active = isSearching ? search : recommended;
  const { isLoading, isError } = active;

  // 검색 결과 전체 건수: 검색 API 응답 res.data.result.totalCount(jobApi.ts:104) —
  // 모든 페이지에 동일 값이 실려오므로 첫 페이지에서 읽음. results.length(누적 로드 수) 아님.
  const searchTotalCount = search.data?.pages[0]?.totalCount;

  const loadMoreRef = useInfiniteScroll(() => {
    if (active.hasNextPage && !active.isFetchingNextPage) active.fetchNextPage();
  }, !!active.hasNextPage);

  // 홈 인기 스크랩 순위(공개 API). 로딩/에러 시 빈 배열 → TrendingScrap 미렌더(§4).
  const { data: trendingItems = [] } = useScrapRankings();

  return (
    <>
      <TopBar>
        {/* 실시간 스크랩 순위 — 검색 중에도 홈과 동일하게 검색바 아래 항상 표시(Figma 1657:20904). */}
        <TrendingScrap items={trendingItems} />
      </TopBar>

      {isSearching ? (
        // 검색 모드(D1·D3): 705 메인(헤더 + 1열 결과) + gap-77 + 302 사이드바(P2·P3, Figma 1657:20904).
        <div className="flex gap-[77px]">
          <main className="w-[705px]">
            {/* 검색 결과 헤더 — 리스트와 32px(§6) */}
            <div className="mb-[32px] flex items-center gap-2">
              <div className="text-base font-bold text-app-text">
                "{q}" 검색 결과
                {searchTotalCount != null && searchTotalCount > 0 && (
                  <span className="ml-1 font-normal text-gray-500">
                    {searchTotalCount}건
                  </span>
                )}
              </div>
            </div>

            {isError ? (
              <NoResults title="공고를 불러오지 못했습니다" description="잠시 후 다시 시도해 주세요." />
            ) : isLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-[124px] animate-pulse rounded-xl border border-app-border bg-app-surface" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <NoResults query={q} />
            ) : (
              <>
                <SearchResultList jobs={jobs} />
                <div ref={loadMoreRef} className="h-8" />
              </>
            )}
          </main>

          {/* 사이드바 — 검색 중에도 유지(P2). 카드 간격 28px(§6) */}
          <aside className="flex w-[302px] flex-col gap-[28px]">
            <DeadlineCard />
            <AINewsCard />
          </aside>
        </div>
      ) : (
        <>
          {/* A. 히어로(440) + 카드 2개(302×306) — flex gap-20 items-center (bg-gray-50·패딩은 MainLayout) */}
          <section className="mb-9 flex items-center gap-5">
            <WelcomeCard />
            <DeadlineCard />
            <AINewsCard />
          </section>

          {/* E. 섹션 타이틀 — ai아이콘24 + 20 SemiBold/-0.4px, 개인화 이름 */}
          <div id="recommended-jobs" className="mb-4 flex scroll-mt-6 items-center gap-3">
            <AiIcon className="h-6 w-6 flex-shrink-0 text-app-primary" />
            <h2 className="font-pretendard text-[20px] font-semibold leading-[140%] tracking-[-0.4px] text-black">
              {name ?? '회원'} 님에게 딱 맞는 공고
            </h2>
          </div>

          <FilterBar />
          <div className="h-7" />

          {isError ? (
            <NoResults title="공고를 불러오지 못했습니다" description="잠시 후 다시 시도해 주세요." />
          ) : isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[124px] animate-pulse rounded-xl border border-app-border bg-app-surface" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <NoResults />
          ) : (
            <section className="w-full max-w-[1164px]">
              <JobList jobs={jobs} />
              <div ref={loadMoreRef} className="h-8" />
            </section>
          )}
        </>
      )}

      {/* 홈 전용 푸터 (Footer.spec §6 — 홈에서만) */}
      <Footer />
    </>
  );
}