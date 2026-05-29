import { Link } from 'react-router-dom';
import BookmarkButton from '@/components/common/BookmarkButton';
import ScoreGauge from '@/components/common/ScoreGauge';
import type { Job } from '@/types/job';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="relative flex h-full flex-col rounded-2xl border border-app-border bg-app-surface p-6 transition-all hover:border-app-border-strong hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-app-border-strong"
    >
      <div className="mb-4 flex items-start justify-between">
        <ScoreGauge score={job.score} variant="semicircle" />
        <BookmarkButton jobId={job.id} />
      </div>

      <h3 className="mb-3 line-clamp-2 min-h-[2.75rem] text-base font-bold leading-snug text-app-text">
        {job.title}
      </h3>

      <div className="mb-4 flex items-center gap-2">
        <span className="truncate text-sm text-app-text-muted">{job.company}</span>
        <span className="flex-shrink-0 rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-bold text-red-500">
          D-{job.dday}
        </span>
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        {job.techStack.slice(0, 3).map((tech) => (
          <span
            key={tech}
            className="rounded-md bg-gray-100 px-3 py-1 text-xs text-app-text-muted"
          >
            {tech}
          </span>
        ))}
      </div>
    </Link>
  );
}
