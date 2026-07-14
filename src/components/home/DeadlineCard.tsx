import { useNavigate } from 'react-router-dom';
import timeIcon from '/mingcute_time-fill.svg';
import EmptyScrap from '@/components/common/EmptyScrap';

// 우측 chevron (size-24). rotate-180 은 사용처에서 부여.
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
    </svg>
  );
}

export interface DeadlineItem {
  id: string;
  title: string;
  company: string;
  dDay: number;
  expiresAt: string;
}

interface DeadlineCardProps {
  jobs: DeadlineItem[];
}

export default function DeadlineCard({ jobs }: DeadlineCardProps) {
  const navigate = useNavigate();

  // 빈 상태 버튼: 같은 홈 화면의 "딱 맞는 공고" 섹션으로 부드럽게 스크롤
  const handleGoToScrap = () => {
    document
      .getElementById('recommended-jobs')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    // 카드 컨테이너: IT 한눈에(§3.1)와 동일 스타일. padding 20 / radius 16.
    // 폭은 홈 그리드 컬럼이 결정(§5.2 ⚠️: 실측 폭/컬럼 폭 일치 여부 확인).
    // ⚠️ border(blue-100 §8.1) / box-shadow(홈카드이펙트 §8.3) 잘린 값 → 근사 유지, TODO.
    <div className="flex h-[306px] w-[302px] flex-col rounded-2xl border border-app-primary-soft bg-card-radial p-5 shadow-homecard">
      <button
        type="button"
        onClick={() => navigate('/scrap')}
        className="mb-3 flex items-center justify-between text-left transition hover:opacity-80"
      >
        {/* 섹션 타이틀 — section 토큰 (18/600/150%/-0.36px/gray-900), 아이콘·타이틀 gap-12 */}
        <span className="inline-flex items-center gap-3 text-[18px] font-semibold leading-[150%] tracking-[-0.36px] text-gray-900">
          <img src={timeIcon} alt="" className="h-6 w-6 flex-shrink-0" />
          곧 마감되는 스크랩 공고
        </span>
        <ChevronIcon className="h-6 w-6 flex-shrink-0 rotate-180 text-app-text-subtle" />
      </button>

      {jobs.length === 0 ? (
        <EmptyScrap onAction={handleGoToScrap} className="flex-1" />
      ) : (
      <ul className="flex flex-col">
        {jobs.map((job, index) => (
          <li
            key={job.id}
            className={index < jobs.length - 1 ? 'border-b-[0.7px] border-gray-200' : ''}
          >
            <button
              type="button"
              // TODO(실데이터): 스크랩 API 연동 시 상세 이동 복구. 지금은 mockJobs 기반이라
              // source 가 없고 mock id 가 실제 API id 와 안 맞아 엉뚱한 상세가 뜰 위험 → 비활성.
              className="flex w-full items-start justify-between gap-2 py-3 text-left transition hover:bg-white/50"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                {/* 항목 제목 — list-title 토큰 (16/500/150%/-0.32px/gray-900) — PASS */}
                <div className="truncate text-base font-medium leading-[150%] tracking-[-0.32px] text-gray-900">
                  {job.title}
                </div>
                {/* 항목 회사명 — 단독 행 (14/400/150%/-0.28px/gray-600) */}
                <div className="truncate text-sm font-normal leading-[150%] tracking-[-0.28px] text-gray-600">
                  {job.company}
                </div>
              </div>
              {/* 우측 컬럼 — D-day(14 Medium blue-500, 배경 없음) + 아래 날짜(12 Regular gray-600) */}
              <div className="flex w-[54px] flex-shrink-0 flex-col items-end gap-1">
                <span className="text-[14px] font-medium leading-[150%] tracking-[-0.28px] text-blue-500">
                  D-{job.dDay}
                </span>
                <span className="text-[12px] font-normal leading-[150%] tracking-[-0.24px] text-gray-600">
                  {job.expiresAt}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}
