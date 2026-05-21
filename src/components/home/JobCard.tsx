import { Link } from 'react-router-dom';
import ScoreGauge from '@/components/common/ScoreGauge';
import { SOURCE_LABEL, type Job } from '@/types/job';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="grid grid-cols-[auto_1fr_auto] items-center gap-6 rounded-xl border border-app-border bg-app-surface px-6 py-5 transition-all hover:border-app-border-strong hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-app-border-strong"
    >
      <ScoreGauge score={job.score} />

      <div className="min-w-0">
        <div className="mb-1 text-base font-bold text-app-text">{job.title}</div>
        <div className="mb-2.5 text-[13px] text-app-text-muted">
          {job.company} · {job.location} · {job.employmentType} · {job.experience}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {job.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-app-border bg-app-bg px-2.5 py-1 text-xs text-app-text-muted"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-shrink-0 flex-col items-end gap-2.5">
        <span className="rounded-md border border-app-border bg-app-bg px-2.5 py-1 text-xs text-app-text-muted">
          {SOURCE_LABEL[job.source]}
        </span>
        <span className="text-sm font-bold text-app-text">D-{job.dday}</span>
      </div>
    </Link>
  );
}
