// API의 status enum ↔ 프론트에서 쓰는 한글 stage 문자열 매핑

export type ApplicationStatus =
  | 'PLANNED'
  | 'APPLIED'
  | 'DOCUMENT_PASSED'
  | 'INTERVIEW_PASSED'
  | 'FINAL_ACCEPTED'
  | 'DOCUMENT_REJECTED'
  | 'INTERVIEW_REJECTED';

export const STATUS_TO_STAGE: Record<ApplicationStatus, string> = {
  PLANNED: '지원예정',
  APPLIED: '지원완료',
  DOCUMENT_PASSED: '서류합격',
  INTERVIEW_PASSED: '면접합격',
  FINAL_ACCEPTED: '최종합격',
  DOCUMENT_REJECTED: '서류탈락',
  INTERVIEW_REJECTED: '면접탈락',
};

export const STAGE_TO_STATUS: Record<string, ApplicationStatus> = {
  지원예정: 'PLANNED',
  지원완료: 'APPLIED',
  서류합격: 'DOCUMENT_PASSED',
  면접합격: 'INTERVIEW_PASSED',
  최종합격: 'FINAL_ACCEPTED',
  서류탈락: 'DOCUMENT_REJECTED',
  면접탈락: 'INTERVIEW_REJECTED',
};

// API: "2025-06-15" → 화면 표시: "2025.06.15"
export const formatDateForDisplay = (date: string | null): string => {
  if (!date) return '';
  return date.replace(/-/g, '.');
};

// 화면 표시: "2025.06.15" → API: "2025-06-15"
// 아직 완성 안 된 날짜(예: 빈 문자열)는 null로 보낸다.
export const formatDateForApi = (date: string): string | null => {
  if (!date) return null;
  const normalized = date.replace(/\./g, '-');
  // yyyy-MM-dd 형식이 아니면(입력 중이거나 형식이 안 맞으면) null 처리
  const isValid = /^\d{4}-\d{2}-\d{2}$/.test(normalized);
  return isValid ? normalized : null;
};