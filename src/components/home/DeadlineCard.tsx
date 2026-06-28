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
    <div className="flex h-[306px] flex-col rounded-xl border border-app-primary-soft bg-card-gradient px-5 py-4 shadow-[0_10px_28px_rgba(71,65,255,0.14)]">
      <button
        type="button"
        onClick={() => navigate('/scrap')}
        className="mb-3 flex items-center justify-between text-left transition hover:opacity-80"
      >
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-app-text">
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
              className="flex h-[49px] w-full items-start justify-between gap-2 px-2 py-3 text-left transition hover:bg-white/50"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-app-text">
                  {job.title}
                </div>
                <div className="truncate text-xs text-app-text-muted">
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
