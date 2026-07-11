import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import FilterBar from '@/components/home/FilterBar';
import JobList from '@/components/home/JobList';
import NoResults from '@/components/home/NoResults';
import TrendingScrap, {
  type TrendingScrapItem,
} from '@/components/home/TrendingScrap';
import { useLatestJobs } from '@/hooks/useInfiniteJobList';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { parseCompanyType } from '@/types/job';
import { mockJobs } from '@/data/mockJobs';

// 게스트 마케팅용 정적 콘텐츠 (spec §3.2 ⚠️ 더미 기본값).
// TODO(API 확인): 실 "IT 한눈에" 데이터 소스 존재 시 교체.
const IT_GLANCE: { title: string; sub: string }[] = [
  { title: '이번 주 IT 공고, 전주보다 12% 늘었어요', sub: '채용 시장이 다시 살아나는 중' },
  { title: '토스, 신입 개발자 공개채용 시작', sub: '서류 마감 D-9' },
  { title: '요즘 뜨는 기술 스택은 Kotlin', sub: '백엔드 공고 언급량 1위' },
];

export default function GuestHome() {
  const navigate = useNavigate();
  const goLogin = () => navigate('/login');

  // §2 실시간 순위 — 회원 홈과 동일한 TrendingScrap 재사용. 게스트 전용 분기 없음.
  // (실시간 순위는 이번 명세 범위 밖 → mockJobs 유지)
  const trendingItems = useMemo<TrendingScrapItem[]>(
    () =>
      [...mockJobs]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((j, i) => ({ id: j.id, rank: i + 1, title: j.title, company: j.company })),
    []
  );

  // 게스트 공고 그리드 — latest-jobs API. matchScore 필드 없음 → 정규화에서 null → 카드 블러.
  const [searchParams] = useSearchParams();
  const companyType = parseCompanyType(searchParams.get('companyType'));
  const filters = { companyTypes: companyType ? [companyType] : undefined };
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useLatestJobs(filters);
  const jobs = data?.pages.flatMap((p) => p.jobs) ?? [];

  const loadMoreRef = useInfiniteScroll(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, !!hasNextPage);

  return (
    <>
      <TopBar />

      {/* §2 검색바 아래 실시간 순위 (회원 컴포넌트 재사용) */}
      <TrendingScrap items={trendingItems} />

      {/* §1 히어로(좌 461) + §3 사이드 카드 2개(우 302 스택) */}
      <section className="mb-9 flex gap-5">
        {/* §1 히어로 배너 — 461×309.355, relative(내부 요소 absolute 프레임 기준, round3).
            배경 /비로그인화면.png center/cover. border-radius ⚠️~20px 추정 → rounded-[20px](§6 TODO).
            요소는 flex 흐름이 아니라 프레임 절대좌표 배치 → 제목-일러스트 겹침 구현 + 순서 충돌 해소(round3).
            ⚠️ 한글 public 경로 — 필요 시 영문 리네임(§6 TODO). */}
        <div
          className="relative h-[309.355px] w-[461px] flex-shrink-0 overflow-hidden rounded-[20px]"
          style={{
            backgroundImage: 'url(/비로그인화면.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* §3.3 일러스트 — top48/right17, 208×227 (제목 아래 레이어) */}
          <img
            src="/비로그인화면컴포넌트.png"
            alt=""
            aria-hidden
            draggable={false}
            className="pointer-events-none absolute right-[17px] top-[48px] h-[227px] w-[208px] select-none object-contain"
          />

          {/* §3.1 제목 — top42/left28, z-10로 일러스트 위 겹침. 28/600(⚠️ 600·500→600)/140%/-0.56px, 2줄 */}
          <h2 className="absolute left-[28px] top-[42px] z-10 font-pretendard text-[28px] font-semibold leading-[140%] tracking-[-0.56px] text-white">
            AI가 24시간
            <br />
            공고를 찾아드려요
          </h2>

          {/* §3.2 펠 — top136/left28. 내부 p8/14, gap4, text 12/400/130%/-0.24px. ⚠️ 배경/radius ❓ → 반투명 pill 잠정 */}
          <span className="absolute left-[28px] top-[136px] z-10 inline-flex items-center justify-center gap-1 rounded-full bg-white/15 px-[14px] py-2 text-center font-pretendard text-[12px] font-normal leading-[130%] tracking-[-0.24px] text-white backdrop-blur-[2px]">
            IT 공고 매칭 서비스
          </span>

          {/* §3.4 버튼 → /login — top220/left28. p10/24, gap10, radius16, bg white/10, text 14/500/150%/-0.28px + 화살표 */}
          <button
            type="button"
            onClick={goLogin}
            className="absolute left-[28px] top-[220px] z-10 inline-flex items-center gap-2.5 rounded-2xl bg-white/10 px-6 py-2.5 font-pretendard text-[14px] font-medium leading-[150%] tracking-[-0.28px] text-white transition hover:bg-white/20"
          >
            지금 시작하기
            <span aria-hidden="true">→</span>
          </button>
        </div>

        {/* §3 정보 카드 2개 — 302×306. round2 §1 정정: 세로 스택이 아니라 히어로와 같은 top
            가로 배치(부모 section이 flex row). 열 간 gap ❓ 미측정 → 20 잠정(TODO). */}
          {/* §3.1 곧 마감되는 스크랩 공고 — 게스트 빈 상태 */}
          <div className="flex h-[306px] w-[302px] flex-col items-start gap-5 rounded-2xl border border-app-border bg-app-surface p-5">
            <span className="text-sm font-bold text-app-text">곧 마감되는 스크랩 공고</span>
            <p className="text-sm text-app-text-muted">로그인 후 관심 공고를 저장해 보세요</p>
            {/* ⚠️ 색상 blue-500 추정(§3.1) */}
            <button
              type="button"
              onClick={goLogin}
              className="mt-auto inline-flex items-center rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              가입하러 가기
            </button>
          </div>

          {/* §3.2 IT 한눈에 — items-end는 좌측정렬 텍스트와 상충(§3.2 ⚠️) → items-start 유지, TODO 확인 */}
          <div className="flex h-[306px] w-[302px] flex-col items-start gap-5 rounded-2xl border border-app-border bg-app-surface p-5">
            <span className="text-sm font-bold text-app-text">IT 한눈에</span>
            <ul className="flex flex-col gap-3">
              {IT_GLANCE.map((row) => (
                <li key={row.title} className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-app-text">{row.title}</span>
                  <span className="text-xs text-app-text-subtle">{row.sub}</span>
                </li>
              ))}
            </ul>
          </div>
      </section>

      {/* §4 섹션 타이틀 — 20/600/140%/-0.4px/#000 */}
      <div className="mb-4 flex items-center gap-2">
        <h2 className="font-pretendard text-[20px] font-semibold leading-[140%] tracking-[-0.4px] text-black">
          ✨ 지금 주목할 만한 공고
        </h2>
      </div>

      <FilterBar />

      {isError ? (
        <NoResults
          title="공고를 불러오지 못했습니다"
          description="잠시 후 다시 시도해 주세요."
        />
      ) : isLoading ? (
        <div className="grid grid-cols-3 gap-[16px]">
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
