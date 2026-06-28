import { mockJobs } from '@/data/mockJobs';
import type { CompanyType, Job } from '@/types/job';
import type { UserCondition } from '@/utils/conditionStorage';

export interface FetchJobsParams {
  cursor?: string;
  companyType?: CompanyType;
  q?: string;
  condition?: UserCondition | null; // 온보딩에서 저장한 맞춤 조건
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

// 사용자 경력(enum) → 대표 연차
const EXPERIENCE_YEARS: Record<string, number> = {
  NEW: 0,
  EXP_1_3: 2,
  EXP_3_5: 4,
  EXP_5_PLUS: 6,
};

// 공고 경력 문구 → [최소, 최대] 연차. (mock 자유 문구라 근사 파싱)
//   '신입' → [0,0] / '신입~경력 3년' → [0,3] / '경력 3년 이상' → [3,∞]
//   파싱 불가 → [0,∞] (통과시켜 결과가 비지 않게)
const parseJobExperience = (text: string): [number, number] => {
  const nums = text.match(/\d+/g)?.map(Number) ?? [];
  const hasNew = text.includes('신입');
  if (hasNew && nums.length === 0) return [0, 0];
  if (hasNew && nums.length > 0) return [0, nums[0]];
  if (nums.length > 0 && text.includes('이상')) return [nums[0], Infinity];
  if (nums.length > 0) return [nums[0], nums[0]];
  return [0, Infinity];
};

// 온보딩 맞춤 조건 매칭. 각 항목은 값이 있을 때만 거른다(빈 항목은 통과)
// → 사용자가 단계를 건너뛰어도 결과가 통째로 비지 않는다.
const matchesCondition = (job: Job, c: UserCondition): boolean => {
  // 지역: 선택 지역 중 하나라도 job.location 에 포함되면 통과
  if (c.locations.length > 0) {
    const ok = c.locations.some((loc) => job.location.includes(loc));
    if (!ok) return false;
  }
  // 직무: 선택 직무 문구가 제목/기술스택에 포함되면 통과 (대소문자 무시)
  if (c.jobTypes.length > 0) {
    const hay = [job.title, ...job.techStack].join(' ').toLowerCase();
    const ok = c.jobTypes.some((jt) => hay.includes(jt.toLowerCase()));
    if (!ok) return false;
  }
  // 경력: 사용자 대표 연차가 공고 허용 범위 안에 들어야 통과
  const userYears = EXPERIENCE_YEARS[c.experience];
  if (userYears !== undefined) {
    const [min, max] = parseJobExperience(job.experience);
    if (userYears < min || userYears > max) return false;
  }
  // 점수: 임계값 이상만 ("나에게 딱 맞는 공고")
  if (job.score < c.scoreThreshold) return false;
  return true;
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
  if (params.condition) {
    filtered = filtered.filter((job) => matchesCondition(job, params.condition!));
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
