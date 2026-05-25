import type { Job } from '@/types/job';
import JobCard from './JobCard';

interface JobListProps {
  jobs: Job[];
}

export default function JobList({ jobs }: JobListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
