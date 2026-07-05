import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import FilterBar from '@/components/home/FilterBar';
import JobList from '@/components/home/JobList';
import { mockJobs } from '@/data/mockJobs';

// 게스트 마케팅용 정적 콘텐츠 (spec §4.2 ⚠️ 더미 기본값).
// TODO(API 확인): 실 "IT 한눈에" 데이터 소스 존재 시 교체.
const IT_GLANCE: { title: string; sub: string }[] = [
  { title: '이번 주 IT 공고, 전주보다 12% 늘었어요', sub: '채용 시장이 다시 살아나는 중' },
  { title: '토스, 신입 개발자 공개채용 시작', sub: '서류 마감 D-9' },
  { title: '요즘 뜨는 기술 스택은 Kotlin', sub: '백엔드 공고 언급량 1위' },
];

export default function GuestHome() {
  const navigate = useNavigate();
  const goLogin = () => navigate('/login');

  // 게스트 공고 그리드 — 더미(mockJobs) 6장, 점수 마스킹 (spec §4.3 ⚠️ 더미 기본값).
  // TODO(API 확인): 비인증 공개 공고 API(GET /api/jobs) 확정 시 교체.
  const jobs = mockJobs.slice(0, 6);

  return (
    <>
      <TopBar />

      {/* 히어로(좌) + 사이드 카드 2개(우) */}
      <section className="mb-9 grid grid-cols-[1fr_360px] gap-[20px]">
        {/* 4.1 히어로 배너 */}
        {/* TODO(Figma): 배경 그라디언트 실측값 + 우측 3D 일러스트 자산(src/assets/, dist 금지). */}
        <div
          className="relative flex h-[306px] flex-col justify-between overflow-hidden rounded-[20px] p-10"
          style={{
            background:
              'linear-gradient(135deg, #6E6AF6 0%, #8A7CF7 55%, #B9A7FA 100%)',
          }}
        >
          <div className="flex flex-col items-start gap-3">
            <span className="inline-flex items-center self-start rounded-full bg-white/15 px-3.5 py-1.5 text-[13px] font-medium text-white backdrop-blur-[2px]">
              IT 공고 매칭 서비스
            </span>
            <h2 className="font-pretendard text-[28px] font-semibold leading-[140%] tracking-[-0.56px] text-white">
              AI가 24시간
              <br />
              공고를 찾아드려요
            </h2>
          </div>
          <button
            type="button"
            onClick={goLogin}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-white px-6 py-3 font-pretendard text-sm font-semibold text-app-text transition hover:opacity-90"
          >
            지금 시작하기
          </button>
        </div>

        {/* 4.2 사이드 카드 2개 */}
        <div className="flex flex-col gap-[20px]">
          {/* ① 곧 마감되는 스크랩 공고 — 게스트 빈 상태 */}
          <div className="flex flex-1 flex-col items-start justify-center gap-3 rounded-2xl border border-app-border bg-app-surface p-6">
            <span className="text-sm font-bold text-app-text">곧 마감되는 스크랩 공고</span>
            <p className="text-sm text-app-text-muted">
              로그인 후 관심 공고를 저장해 보세요
            </p>
            <button
              type="button"
              onClick={goLogin}
              className="mt-1 inline-flex items-center rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              가입하러 가기
            </button>
          </div>

          {/* ② IT 한눈에 */}
          <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-app-border bg-app-surface p-6">
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
        </div>
      </section>

      {/* 공고 그리드 (마스킹) */}
      <div className="mb-4 flex items-center gap-2">
        <div className="text-base font-bold text-app-text">✨ 나에게 딱 맞는 공고</div>
      </div>

      <FilterBar />

      <section className="w-full max-w-[1164px]">
        <JobList jobs={jobs} masked />
      </section>
    </>
  );
}
