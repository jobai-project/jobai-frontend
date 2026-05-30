export type CompanyType = 'PUBLIC' | 'PRIVATE';

export type CompanyFilter = CompanyType | 'ALL';

export type JobSource = 'WORKNET' | 'SARAMIN' | 'ALIO' | 'RSS';

export const COMPANY_FILTER_OPTIONS: ReadonlyArray<{ value: CompanyFilter; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'PUBLIC', label: '공기업' },
  { value: 'PRIVATE', label: '사기업' },
];

export function parseCompanyType(value: string | null): CompanyType | undefined {
  return value === 'PUBLIC' || value === 'PRIVATE' ? value : undefined;
}

export const SOURCE_LABEL: Record<JobSource, string> = {
  WORKNET: '워크넷',
  SARAMIN: '사람인',
  ALIO: '알리오',
  RSS: 'RSS',
};

export interface Job {
  id: string;
  company: string;
  title: string;
  location: string;
  employmentType: string;
  experience: string;
  score: number;
  techStack: string[];
  source: JobSource;
  companyType: CompanyType;
  dday: number;
  // 상세 페이지 전용 필드
  jobGroup?: string;
  workLocation?: string;
  blueprint?: string;
  recruitmentType?: string;
  postedDate?: string;
  deadline?: string;
  requirements?: {
    experience?: string;
    education?: string;
    skills?: string[];
  };
  aiSummary?: string;
  applyUrl?: string;
}

// 점수 분석 항목
export interface ScoreAnalysis {
  label: string;
  description: string;
}
 
export const SCORE_ANALYSIS_ITEMS: readonly ScoreAnalysis[] = [
  { label: 'React·TypeScript 스킬', description: '기술 스택 3/5개 일치' },
  { label: 'Frontend 경력', description: '3년 이상 경력 일치' },
  { label: '자격요건', description: '전체 요구사항 85% 충족' },
] as const;
