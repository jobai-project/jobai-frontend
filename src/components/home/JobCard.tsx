import { Link } from 'react-router-dom';
import BookmarkButton from '@/components/common/BookmarkButton';
import ScoreGauge from '@/components/common/ScoreGauge';
import { SOURCE_LABEL, type Job } from '@/types/job';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="relative flex h-full flex-col gap-3 rounded-xl border border-app-border bg-app-surface p-5 transition-all hover:border-app-border-strong hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-app-border-strong"
    >
      <BookmarkButton jobId={job.id} className="absolute right-2 top-2" />

      <div className="pr-8">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-bold leading-snug text-app-text">
          {job.title}
        </h3>
      </div>

      <div className="flex items-center gap-2">
        <span className="truncate text-sm text-app-text-muted">{job.company}</span>
        <span className="flex-shrink-0 rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-bold text-red-500">
          D-{job.dday}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {job.techStack[0] && (
          <span className="rounded-md border border-app-border bg-app-bg px-2 py-0.5 text-xs text-app-text-muted">
            {job.techStack[0]}
          </span>
        )}
        <span className="ml-auto rounded-md border border-app-border bg-app-bg px-2 py-0.5 text-[11px] text-app-text-subtle">
          {SOURCE_LABEL[job.source]}
        </span>
      </div>

      <div className="mt-auto pt-2">
        <ScoreGauge score={job.score} variant="bar" label="✨ AI 적합도" size="sm" />
      </div>
    </Link>
  );
}
