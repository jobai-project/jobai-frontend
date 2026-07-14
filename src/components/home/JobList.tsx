import type { JobSummary } from '@/types/jobApi';
import JobCard from './JobCard';

interface JobListProps {
  jobs: JobSummary[];
  // 게스트 마스킹 모드를 각 카드로 전달 (spec §4.3).
  masked?: boolean;
}

export default function JobList({ jobs, masked = false }: JobListProps) {
  // 프레임 grid-cols-3 grid-rows-2 gap-20. grid-rows-2 는 무한스크롤(6개 초과)과 충돌해
  // 의도적으로 미고정 — 초기 6개는 자연히 2행.
  return (
    <div className="grid grid-cols-3 gap-[20px]">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} masked={masked} />
      ))}
    </div>
  );
}
