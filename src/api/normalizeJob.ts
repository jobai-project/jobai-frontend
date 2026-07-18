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
  RawScrapRanking,
  ScrapRanking,
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

// 검색 결과 정규화 → JobSummary. 검색 전용 SearchResultRow 가 렌더.
// matchScore(이력서 기준 점수)는 recommended-jobs 와 동일. 게스트/이력서X → null → 블러 "??".
// deadline(날짜|null) → dDay 계산. jobCategory 는 검색 행 메타에 사용하므로 되살린다(applyUrl 만 생략).
export const normalizeSearchJob = (raw: RawSearchJob): JobSummary => ({
  id: raw.id,
  source: raw.source,
  company: raw.company,
  title: raw.title,
  matchScore: raw.matchScore ?? null,
  dDay: deadlineToDday(raw.deadline),
  location: raw.location,
  employmentType: raw.employmentType,
  jobCategory: raw.jobCategory,
});

// 홈 인기 스크랩 순위 정규화. Raw 와 필드 동일(companyName 유지) — source 는 PUBLIC/PRIVATE 그대로.
// rank 는 응답값을 그대로 사용(프론트에서 index+1 로 매기지 않음).
export const normalizeScrapRanking = (raw: RawScrapRanking): ScrapRanking => ({
  rank: raw.rank,
  source: raw.source,
  sourceId: raw.sourceId,
  title: raw.title,
  companyName: raw.companyName,
  scrapCount: raw.scrapCount,
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
  matchScore: raw.matchScore ?? null,
  scoreReason: raw.scoreReason ?? null,
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
