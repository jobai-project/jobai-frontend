// 공고 API 공통 타입 + 정규화 대상 타입.
// 레거시 mock `Job`(types/job.ts)과 격리하기 위해 별도 파일로 둔다.
//
// source 필드 타입: 스펙은 새 `JobSource='PUBLIC'|'PRIVATE'`를 제안하나, 기존
// job.ts 의 `JobSource`(WORKNET/SARAMIN/... 크롤 출처)와 이름이 충돌한다. 값이
// CompanyType('PUBLIC'|'PRIVATE')과 동일하므로 CompanyType 를 재사용한다(감사 A1).
import type { CompanyType } from './job';

// ── 목록 API 원시 응답 (latest-jobs / recommended-jobs) ──────────────
// latest-jobs(게스트)엔 matchScore 필드가 아예 없으므로 optional 로 둔다.
export interface RawJobSummary {
  id: number;
  source: CompanyType;
  companyName: string;
  title: string;
  dDay: number | null;
  location: string;
  employmentType: string;
  matchScore?: number | null; // recommended-jobs 에만 존재
}

// ── 목록 카드용 공통 타입 ─────────────────────────────────────────────
export interface JobSummary {
  id: number;
  source: CompanyType;
  company: string; // ← companyName
  title: string;
  matchScore: number | null; // null = 점수 없음(게스트/이력서X) → 블러
  dDay: number | null; // null = 마감일 없음(상시)
  location: string;
  employmentType: string;
}

// ── 상세 API 원시 응답 ────────────────────────────────────────────────
export interface RawPrivateJobDetail {
  id: number;
  title: string;
  company: string;
  location: string;
  employmentType: string;
  description: string;
  deadline: string | null;
  applyUrl: string | null;
  jobCategory: string | null;
  summary: string | null; // LLM 요약(캐시 없으면 null)
  createdAt: string;
}

export interface RawPublicJobDetail {
  id: number;
  title: string;
  companyName: string;
  workRegion: string; // 콤마 문자열 "서울,광주,전남"
  recrutType: string;
  htmlContent: string;
  endDate: string | null;
  applyLink: string | null;
  jobRole: string | null;
  workExperience: string | null;
  applyQualification: string | null;
  disqualificationReason: string | null;
  applicationMethod: string | null;
  isClosed: boolean;
  companyType: string | null; // 대부분 빈 값
  beginDate: string | null;
}

// ── 상세용 공통 타입 (판별 유니온: source 로 구분) ───────────────────
interface JobDetailBase {
  id: number;
  source: CompanyType;
  title: string;
  company: string;
  location: string; // 공공은 workRegion(콤마 문자열) 그대로
  employmentType: string; // 공공은 recrutType
  content: string; // 본문
  contentFormat: 'text' | 'html'; // 사기업 text / 공공 html
  deadline: string | null; // null = 상시모집
  applyUrl: string | null;
}

export interface PrivateJobDetail extends JobDetailBase {
  source: 'PRIVATE';
  jobCategory: string | null;
  summary: string | null;
  createdAt: string;
}

export interface PublicJobDetail extends JobDetailBase {
  source: 'PUBLIC';
  jobRole: string | null;
  workExperience: string | null;
  applyQualification: string | null;
  disqualificationReason: string | null;
  applicationMethod: string | null;
  isClosed: boolean;
  companyType: string | null; // 대부분 빈 값
  beginDate: string | null;
}

export type JobDetail = PrivateJobDetail | PublicJobDetail;
