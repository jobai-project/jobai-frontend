import { useNavigate, useSearchParams } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import FilterBar from '@/components/home/FilterBar';
import JobList from '@/components/home/JobList';
import NoResults from '@/components/home/NoResults';
import TrendingScrap from '@/components/home/TrendingScrap';
import { useLatestJobs } from '@/hooks/useInfiniteJobList';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useTechCards, toTechGlanceRows } from '@/hooks/useTechCards';
import { useScrapRankings } from '@/hooks/useScrapRankings';
import { parseCompanyType, type CompanyType } from '@/types/job';

// 우측 chevron (size-24). rotate-180 은 사용처에서 부여.
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9 6 6 6-6 6"
      />
    </svg>
  );
}

// 섹션 타이틀용 ai 아이콘 (size-24, §4-2). mingcute:ai-fill 근사.
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

// 히어로 버튼 화살표 (14×14, §3A-6).
function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" aria-hidden="true" className={className}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 7h9M8 3.5 11.5 7 8 10.5"
      />
    </svg>
  );
}

export default function GuestHome() {
  const navigate = useNavigate();
  const goLogin = () => navigate('/login');

  // §2 실시간 순위 — 회원 홈과 동일한 TrendingScrap 재사용. 게스트 전용 분기 없음.
  // 공개 API(useScrapRankings) → 게스트도 순위 노출. 클릭 시 컴포넌트가 /login 으로 유도.
  const { data: trendingItems = [] } = useScrapRankings();

  // 게스트 공고 그리드 — latest-jobs API. matchScore 필드 없음 → 정규화에서 null → 카드 블러.
  const [searchParams] = useSearchParams();
  // 기업형태 다중: 반복 쿼리 → 유효값만 + 중복 제거 (HomePage와 동일).
  const companyTypes = [
    ...new Set(
      searchParams
        .getAll('companyType')
        .map(parseCompanyType)
        .filter((c): c is CompanyType => c !== undefined),
    ),
  ];
  const locations = searchParams.getAll('location');
  const employmentTypes = searchParams.getAll('employmentType');
  const filters = {
    companyTypes: companyTypes.length ? companyTypes : undefined,
    locations: locations.length ? locations : undefined,
    employmentTypes: employmentTypes.length ? employmentTypes : undefined,
  };
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useLatestJobs(filters);
  const jobs = data?.pages.flatMap((p) => p.jobs) ?? [];

  // "IT 한눈에" — tech-cards API (인증 불필요). 목록 훅과 이름 충돌 피해 별칭.
  const {
    data: techData,
    isLoading: techLoading,
    isError: techError,
  } = useTechCards();
  const techRows = toTechGlanceRows(techData?.cards ?? []);

  const loadMoreRef = useInfiniteScroll(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, !!hasNextPage);

  return (
    <>
      {/* §2 검색바 + 아래 실시간 순위를 한 716 컬럼으로 (Figma 1648:16406) */}
      <TopBar>
        <TrendingScrap items={trendingItems} />
      </TopBar>

      {/* §3 히어로(440) + 사이드 카드 2개(302×306) — bg-gray-50 행, gap-20 items-center */}
      <section className="mb-9 flex items-center gap-5">
        {/* §4(3-A) 히어로 배너 — 배경(보라 그라디언트)+일러스트 통합 PNG 1장(guest-hero.png).
            타이틀·필·버튼만 코드 오버레이. w-440 h-306 rounded-lg(16) shadow-homecard.
            비율(1882×1346≈1.40) ≈ 카드(440×306≈1.44) → cover+center 로 세로 미세 크롭만. */}
        <div
          className="relative h-[306px] w-[440px] flex-shrink-0 overflow-clip rounded-lg shadow-homecard"
          style={{
            // 108%: PNG 4변 투명 여백(≈47px)을 카드 밖으로 밀어 crop(둥근 카드 흰 테두리 제거).
            // cover(=100% 폭) 대비 ~8% 확대 → 가로 여백 2.6%·세로 3.6%를 여유 있게 덮음.
            backgroundImage: 'url(/guest-hero.png)',
            backgroundSize: '108%',
            backgroundPosition: 'center',
          }}
        >
          {/* 3A-2 콘텐츠 origin left-28 top-42, 내부 w-350, 타이틀↔버튼 gap-52 */}
          <div className="absolute left-[28px] top-[42px] z-10 flex w-[350px] flex-col gap-[52px]">
            <div className="flex flex-col gap-4">
              {/* 3A-3 타이틀 — 28/140%/-0.56px white. 혼용: AI·24·"공고를 찾아드려요"=SemiBold, 가·시간=Medium */}
              <h2 className="font-pretendard text-[28px] leading-[1.4] tracking-[-0.56px] text-white">
                <span className="block">
                  <span className="font-semibold">AI</span>
                  <span className="font-medium">가 </span>
                  <span className="font-semibold">24</span>
                  <span className="font-medium">시간</span>
                </span>
                <span className="block font-semibold">공고를 찾아드려요</span>
              </h2>
              {/* 3A-4 필 — bg-white/10, px-14 py-8, rounded-full, 12/400/130%/-0.24px, blur-2px */}
              <span className="inline-flex items-center gap-1 self-start rounded-full bg-white/10 px-[14px] py-2 font-pretendard text-[12px] font-normal leading-[130%] tracking-[-0.24px] text-white backdrop-blur-[2px]">
                IT 공고 매칭 서비스
              </span>
            </div>
            {/* 3A-6 버튼 → /login. px-24 py-10, rounded-lg(16), gap-6, arrow 14×14 */}
            <button
              type="button"
              onClick={goLogin}
              className="inline-flex items-center gap-1.5 self-start rounded-2xl bg-white/10 px-6 py-2.5 font-pretendard text-[14px] font-medium leading-[150%] tracking-[-0.28px] text-white transition hover:bg-white/20"
            >
              지금 시작하기
              <ArrowIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* §5(3-B) 곧 마감되는 스크랩 공고 — 게스트 빈 상태 */}
        <div className="flex h-[306px] w-[302px] flex-col gap-5 rounded-2xl border border-blue-100 bg-card-radial p-5 shadow-homecard">
          {/* 3B-3 헤더 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/mingcute_time-fill.svg" alt="" aria-hidden className="h-6 w-6 flex-shrink-0" />
              <span className="text-[18px] font-semibold tracking-[-0.36px] text-gray-900">
                곧 마감되는 스크랩 공고
              </span>
            </div>
            <ChevronIcon className="h-6 w-6 flex-shrink-0 text-gray-400" />
          </div>
          {/* 3B-4 빈 상태 본문 — 중앙정렬, gap-32 */}
          <div className="flex flex-1 flex-col items-center justify-center gap-8">
            {/* 3B-5 북마크-슬래시 아이콘 — 54×52.65 (noscrap.svg 재사용) */}
            <img src="/noscrap.svg" alt="" aria-hidden className="h-[52.65px] w-[54px] select-none" />
            {/* 3B-6 안내문 — 16 SemiBold/130%/-0.32px/gray-500 */}
            <p className="text-center text-[16px] font-semibold leading-[1.3] tracking-[-0.32px] text-gray-500">
              로그인 후 관심 공고를 저장해 보세요
            </p>
            {/* 3B-7 버튼 — bg-blue-50, text-blue-500, px-16 py-10, rounded-[12px] */}
            <button
              type="button"
              onClick={goLogin}
              className="inline-flex items-center rounded-[12px] bg-purple-50 px-4 py-2.5 text-sm font-semibold tracking-[-0.28px] text-blue-500 transition hover:bg-blue-100"
            >
              가입하러 가기
            </button>
          </div>
        </div>

        {/* §6(3-C) IT 한눈에 */}
        <div className="flex h-[306px] w-[302px] flex-col gap-5 rounded-2xl border border-blue-100 bg-card-radial p-5 shadow-homecard">
          {/* 3C-2 헤더 — gap-12, news 아이콘 24, 18 SemiBold/-0.36px/black */}
          <div className="flex items-center gap-3">
            <img src="/iconamoon_news-fill.svg" alt="" aria-hidden className="h-6 w-6 flex-shrink-0" />
            <span className="text-[18px] font-semibold tracking-[-0.36px] text-black">IT 한눈에</span>
          </div>
          {techLoading ? (
            // 스켈레톤 3줄
            <ul className="flex flex-col">
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className={i < 2 ? 'border-b-[0.7px] border-gray-200' : ''}>
                  <div className="flex w-full flex-col gap-2 px-1 py-3">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                  </div>
                </li>
              ))}
            </ul>
          ) : techError ? (
            <div className="px-1 py-3 text-[14px] text-gray-500">정보를 불러오지 못했어요</div>
          ) : (
            <ul className="flex flex-col">
              {techRows.map((row, i) => {
                // 항목 내용. 테크 뉴스 줄만 originalUrl 새 탭 링크(§2-2).
                const inner = (
                  <div className="flex w-full items-center justify-between gap-1 px-1 py-3">
                    <div className="flex min-w-0 flex-col gap-2">
                      {/* 3C-4 제목 — 14 Medium/-0.28px/black */}
                      <span className="truncate text-[14px] font-medium tracking-[-0.28px] text-black">
                        {row.title}
                      </span>
                      {/* 3C-5 서브 — 12 Regular/-0.24px/gray-600 */}
                      <span className="truncate text-[12px] tracking-[-0.24px] text-gray-600">
                        {row.sub}
                      </span>
                    </div>
                    {/* 3C-6 chevron 24 rotate-180 */}
                    <ChevronIcon className="h-6 w-6 flex-shrink-0 rotate-180 text-gray-400" />
                  </div>
                );
                return (
                  <li
                    key={`${row.badge}-${i}`}
                    className={i < techRows.length - 1 ? 'border-b-[0.7px] border-gray-200' : ''}
                  >
                    {row.url ? (
                      <a href={row.url} target="_blank" rel="noopener noreferrer" className="block">
                        {inner}
                      </a>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* §7 섹션 헤더 블록 — 타이틀 + 필터 묶음(flex-col gap-16) */}
      <div className="mb-4 flex flex-col gap-4">
        {/* 4-2 섹션 타이틀 — ai 아이콘 24 + 20/600/140%/-0.4px/#000, gap-12 */}
        <div className="flex items-center gap-3">
          <AiIcon className="h-6 w-6 flex-shrink-0 text-app-primary" />
          <h2 className="font-pretendard text-[20px] font-semibold leading-[140%] tracking-[-0.4px] text-black">
            지금 주목할 만한 공고
          </h2>
        </div>
        <FilterBar guest />
      </div>

      {isError ? (
        <NoResults
          title="공고를 불러오지 못했습니다"
          description="잠시 후 다시 시도해 주세요."
        />
      ) : isLoading ? (
        <div className="grid grid-cols-3 gap-[20px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[220px] animate-pulse rounded-2xl border border-app-border bg-app-surface"
            />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <NoResults />
      ) : (
        <section className="w-full max-w-[1164px]">
          <JobList jobs={jobs} masked />
          <div ref={loadMoreRef} className="h-8" />
        </section>
      )}

    </>
  );
}
