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
}
