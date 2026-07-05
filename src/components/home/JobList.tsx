import type { Job } from '@/types/job';
import JobCard from './JobCard';

interface JobListProps {
  jobs: Job[];
  // 게스트 마스킹 모드를 각 카드로 전달 (spec §4.3).
  masked?: boolean;
}

export default function JobList({ jobs, masked = false }: JobListProps) {
  return (
    <div className="grid grid-cols-3 gap-[16px]">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} masked={masked} />
      ))}
    </div>
  );
}
