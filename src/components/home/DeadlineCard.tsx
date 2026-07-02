import { useNavigate } from 'react-router-dom';
import timeIcon from '/mingcute_time-fill.svg';
import EmptyScrap from '@/components/common/EmptyScrap';

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
    <div className="flex h-[306px] flex-col rounded-2xl border border-app-primary-soft bg-card-gradient p-5 shadow-[0_10px_28px_rgba(71,65,255,0.14)]">
      <button
        type="button"
        onClick={() => navigate('/scrap')}
        className="mb-3 flex items-center justify-between text-left transition hover:opacity-80"
      >
        {/* 섹션 타이틀 — section 토큰 (18/600/150%/-0.36px/gray-900) */}
        <span className="inline-flex items-center gap-2 text-[18px] font-semibold leading-[150%] tracking-[-0.36px] text-gray-900">
          <img src={timeIcon} alt="" className="h-6 w-6 flex-shrink-0" />
          곧 마감되는 스크랩 공고
        </span>
        <span aria-hidden="true" className="text-lg text-app-text-subtle">
          ›
        </span>
      </button>

      {jobs.length === 0 ? (
        <EmptyScrap onAction={handleGoToScrap} className="flex-1" />
      ) : (
      <ul className="flex flex-col">
        {jobs.map((job, index) => (
          <li
            key={job.id}
            className={index < jobs.length - 1 ? 'border-b-[0.7px] border-app-border/70' : ''}
          >
            <button
              type="button"
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="flex w-full items-start justify-between gap-2 px-2 py-3 text-left transition hover:bg-white/50"
            >
              <div className="min-w-0 flex-1">
                {/* 항목 제목 — list-title 토큰 (16/500/150%/-0.32px/gray-900) */}
                <div className="truncate text-base font-medium leading-[150%] tracking-[-0.32px] text-gray-900">
                  {job.title}
                </div>
                {/* 항목 서브(회사명·마감일) — caption 토큰 (14/400/150%/-0.28px/gray-600) */}
                <div className="truncate text-sm font-normal leading-[150%] tracking-[-0.28px] text-gray-600">
                  {job.company} · {job.expiresAt}
                </div>
              </div>
              <span className="flex-shrink-0 rounded-md bg-[#FFF0F1] px-1.5 py-0.5 text-xs font-bold text-[#FF4545]">
                D-{job.dDay}
              </span>
            </button>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}
