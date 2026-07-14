// 공고 raw 응답 → 공통 타입 정규화 (순수 함수, API 호출 없음).
// envelope 는 자동 언랩되지 않으므로(axios.ts:38-39) 호출부가 res.data.result 를
// 벗겨서 아래 함수에 넘긴다.
import type {
  RawJobSummary,
  JobSummary,
  RawPrivateJobDetail,
  PrivateJobDetail,
  RawPublicJobDetail,
  PublicJobDetail,
  RawRelatedJob,
  RelatedJob,
  RawTechCard,
  TechCard,
  RawTechCardsResult,
  TechCardsResult,
  RawSearchJob,
} from '@/types/jobApi';
import { deadlineToDday } from '@/utils/dDay';

// 목록 정규화 (게스트/회원 공용).
// matchScore 통일이 핵심: 게스트(필드 undefined)·이력서X(null)·이력서O(점수)를
// `?? null` 한 줄로 통일 → 소비 측은 matchScore === null 이면 블러.
export const normalizeJobSummary = (raw: RawJobSummary): JobSummary => ({
  id: raw.id,
  source: raw.source,
  company: raw.companyName,
  title: raw.title,
  matchScore: raw.matchScore ?? null,
  dDay: raw.dDay,
  location: raw.location,
  employmentType: raw.employmentType,
});

// tech-cards 연관공고 정규화. companyName → company (목록과 동일 규약).
const normalizeRelatedJob = (raw: RawRelatedJob): RelatedJob => ({
  id: raw.id,
  source: raw.source,
  company: raw.companyName,
  title: raw.title,
});

// tech-cards 카드 정규화. nullable 필드는 명세대로 유지:
//   id(INTERNAL=null)·originalUrl·publishedAt·relatedJobs(HACKERNEWS=null).
// relatedJobs 는 배열일 때만 항목 정규화, null 이면 null 그대로 통과.
export const normalizeTechCard = (raw: RawTechCard): TechCard => ({
  id: raw.id,
  source: raw.source,
  badge: raw.badge,
  headline: raw.headline,
  subtext: raw.subtext,
  originalUrl: raw.originalUrl,
  publishedAt: raw.publishedAt,
  createdAt: raw.createdAt,
  relatedJobs: raw.relatedJobs ? raw.relatedJobs.map(normalizeRelatedJob) : null,
});

export const normalizeTechCardsResult = (
  raw: RawTechCardsResult,
): TechCardsResult => ({
  cards: raw.cards.map(normalizeTechCard),
});

// 검색 결과 정규화 → 목록과 동일 JobSummary(같은 JobCard 재사용).
// matchScore 는 검색 응답에 없음 → null(점수 게이지 블러, 스펙상 정상).
// deadline(날짜|null) → dDay 계산. jobCategory/applyUrl 은 카드 미사용이라 생략.
export const normalizeSearchJob = (raw: RawSearchJob): JobSummary => ({
  id: raw.id,
  source: raw.source,
  company: raw.company,
  title: raw.title,
  matchScore: null,
  dDay: deadlineToDday(raw.deadline),
  location: raw.location,
  employmentType: raw.employmentType,
});

// 사기업 상세 정규화. 본문은 text.
export const normalizePrivateJobDetail = (
  raw: RawPrivateJobDetail,
): PrivateJobDetail => ({
  id: raw.id,
  source: 'PRIVATE',
  title: raw.title,
  company: raw.company,
  location: raw.location,
  employmentType: raw.employmentType,
  content: raw.description,
  contentFormat: 'text',
  deadline: raw.deadline,
  applyUrl: raw.applyUrl,
  jobCategory: raw.jobCategory,
  // summary 는 본문 응답에 없음 → /summary 엔드포인트(useJobSummary)에서 별도 조회(④).
  createdAt: raw.createdAt,
});

// 공공기관 상세 정규화. 본문은 html. workRegion 콤마 문자열은 분리하지 않고 그대로.
export const normalizePublicJobDetail = (
  raw: RawPublicJobDetail,
): PublicJobDetail => ({
  id: raw.id,
  source: 'PUBLIC',
  title: raw.title,
  company: raw.companyName,
  location: raw.workRegion,
  employmentType: raw.recrutType,
  content: raw.htmlContent,
  contentFormat: 'html',
  deadline: raw.endDate,
  applyUrl: raw.applyLink,
  jobRole: raw.jobRole,
  workExperience: raw.workExperience,
  applyQualification: raw.applyQualification,
  disqualificationReason: raw.disqualificationReason,
  applicationMethod: raw.applicationMethod,
  isClosed: raw.isClosed,
  companyType: raw.companyType,
  beginDate: raw.beginDate,
});
