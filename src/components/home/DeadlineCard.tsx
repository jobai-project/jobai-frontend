import { useNavigate } from 'react-router-dom';

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

  return (
    <div className="flex h-[306px] w-[348px] flex-shrink-0 flex-col rounded-xl border border-app-border bg-gradient-to-br from-blue-50 to-white px-5 py-4">
      <button
        type="button"
        onClick={() => navigate('/deadline')}
        className="mb-3 flex items-center justify-between text-left transition hover:opacity-80"
      >
        <span className="text-sm font-semibold text-app-text">
          🕐 마감 기한이 얼마 남지 않았어요
        </span>
        <span aria-hidden="true" className="text-lg text-app-text-subtle">
          ›
        </span>
      </button>

      <ul className="flex flex-col divide-y divide-app-border/70">
        {jobs.map((job) => (
          <li key={job.id}>
            <button
              type="button"
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="flex w-full items-center justify-between gap-2 py-2 text-left transition hover:bg-white/50"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-app-text">
                  {job.title}
                </div>
                <div className="truncate text-xs text-app-text-muted">
                  {job.company} · {job.expiresAt}
                </div>
              </div>
              <span className="flex-shrink-0 rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-bold text-red-500">
                D-{job.dDay}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
