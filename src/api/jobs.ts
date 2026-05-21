import { mockJobs } from '@/data/mockJobs';
import type { CompanyType, Job } from '@/types/job';

export interface FetchJobsParams {
  cursor?: string;
  companyType?: CompanyType;
  q?: string;
}

export interface FetchJobsResponse {
  jobs: Job[];
  nextCursor: string | null;
}

const matchesQuery = (job: Job, q: string): boolean => {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const hay = [
    job.title,
    job.company,
    job.location,
    job.employmentType,
    job.experience,
    ...job.techStack,
  ]
    .join(' ')
    .toLowerCase();
  return hay.includes(needle);
};

export const fetchJobs = async (
  params: FetchJobsParams = {},
): Promise<FetchJobsResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = mockJobs;
  if (params.companyType) {
    filtered = filtered.filter((job) => job.companyType === params.companyType);
  }
  if (params.q && params.q.trim()) {
    filtered = filtered.filter((job) => matchesQuery(job, params.q!));
  }

  return {
    jobs: filtered,
    nextCursor: null,
  };
};

export const fetchJobDetail = async (id: string): Promise<Job> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const job = mockJobs.find((j) => j.id === id);
  if (!job) {
    throw new Error(`공고를 찾을 수 없습니다 (id=${id})`);
  }
  return job;
};
