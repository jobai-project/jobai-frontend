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
  // 검색 결과 행(SearchResultRow)에서만 사용. 추천/최신 목록(JobCard)은 미사용 → optional.
  jobCategory?: string | null;
}

// ── tech-cards (홈 IT 인사이트 카드) 원시 응답 ────────────────────────
// INTERNAL 카드는 id=null(내부 집계·공고 없음), HACKERNEWS 카드는 relatedJobs=null.
export interface RawRelatedJob {
  id: number;
  source: CompanyType; // 'PUBLIC' | 'PRIVATE'
  companyName: string;
  title: string;
}
export interface RawTechCard {
  id: number | null; // INTERNAL 카드는 null
  source: 'INTERNAL' | 'HACKERNEWS';
  badge: string; // '채용 트렌드' | '신규 공고' | '테크 뉴스'
  headline: string;
  subtext: string;
  originalUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  relatedJobs: RawRelatedJob[] | null; // HACKERNEWS 카드는 null
}
export interface RawTechCardsResult {
  cards: RawTechCard[]; // 최대 3장
}

// ── tech-cards 카드용 공통 타입 ───────────────────────────────────────
// companyName → company 는 목록 정규화(normalizeJobSummary)와 동일 규약.
// nullable(id/originalUrl/publishedAt/relatedJobs)은 명세대로 유지한다.
export interface RelatedJob {
  id: number;
  source: CompanyType;
  company: string; // ← companyName
  title: string;
}
export interface TechCard {
  id: number | null;
  source: 'INTERNAL' | 'HACKERNEWS';
  badge: string;
  headline: string;
  subtext: string;
  originalUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  relatedJobs: RelatedJob[] | null;
}
export interface TechCardsResult {
  cards: TechCard[];
}

// ── 자연어 공고 검색 (GET /api/search/jobs) 원시 응답 ──────────────────
// 목록 API 와 달리 matchScore 없음, deadline(날짜)만 제공(dDay 는 프론트 계산).
export interface RawSearchJob {
  id: number;
  source: CompanyType; // 'PRIVATE' | 'PUBLIC'
  title: string;
  company: string;
  location: string;
  jobCategory: string | null;
  employmentType: string;
  applyUrl: string;
  deadline: string | null; // 'YYYY-MM-DD' | null(상시)
  createdAt: string; // ISO datetime
  matchScore?: number | null; // 이력서 기준 점수(0~100). recommended-jobs 와 동일, 없으면 null
}

// 서버가 KEYWORD ↔ VECTOR 자동 전환. 데이터만 수신, 표시는 후속(§6 B구역).
export interface SearchInfo {
  method: 'KEYWORD' | 'VECTOR';
  matchedCategories: string[];
  expandedKeywords: string[];
}

export interface SearchJobsResult {
  totalCount: number;
  jobs: RawSearchJob[];
  searchInfo: SearchInfo;
}

// ── 홈 인기 스크랩 순위 (GET /api/v1/home/scrap-rankings) 원시 응답 ──────
// 인증 불필요·파라미터 없음. rankings 최대 5개(스크랩수 내림차순, 마감 제외).
// source 는 'PRIVATE'|'PUBLIC'(=CompanyType, 상세 라우트용). mockJobs 의 크롤 출처(SARAMIN 등)와 무관.
export interface RawScrapRanking {
  rank: number;
  source: CompanyType; // 'PRIVATE' | 'PUBLIC'
  sourceId: number;
  title: string;
  companyName: string;
  scrapCount: number;
}
export interface RawScrapRankingsResult {
  rankings: RawScrapRanking[];
}

// ── 인기 스크랩 순위 도메인 타입 ──
// 목록 정규화와 달리 companyName 을 그대로 유지(상세이동엔 source+sourceId 만 필요).
export interface ScrapRanking {
  rank: number;
  source: CompanyType;
  sourceId: number;
  title: string;
  companyName: string;
  scrapCount: number;
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
  // 라이브 실측(private-jobs/808): matchScore(number), scoreReason(개행 4줄) 존재. optional 로 안전 폴백.
  matchScore?: number | null;
  scoreReason?: string | null;
  // summary 제거: 본문 API(private-jobs/{id}) 응답엔 summary 필드 없음(③ 라이브 확정).
  // LLM 요약은 별도 엔드포인트(/summary)에서 useJobSummary 로 독립 조회한다(④).
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
  // 상세 응답 점수. Base 미승격: public-jobs 응답 동일필드 존재 여부 미확인(1-2 ❓) — 확인 후 승격 검토.
  matchScore: number | null;
  scoreReason: string | null;
  // summary 는 본문 타입에서 분리 — 별도 /summary 엔드포인트(useJobSummary)로 조회(④).
  createdAt: string;
}

// LLM 온디맨드 요약 (GET /api/v1/private-jobs/{id}/summary 의 result.summary).
// 사기업 전용. 4개 배열 — 빈 배열이면 소비 측에서 해당 그룹 숨김.
export interface JobLlmSummary {
  techStack: string[];
  responsibilities: string[];
  qualifications: string[];
  preferredQualifications: string[];
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
