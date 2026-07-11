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
} from '@/types/jobApi';

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
  summary: raw.summary,
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
