// 이력서 목록 아이템 (GET /api/v1/members/resumes 의 result.resumes[])
// resumeId 는 백엔드 Long → JS number. string 아님.
export interface ResumeItem {
  resumeId: number;
  originalFilename: string;
  storedFileUrl: string;
  fileSize: string; // 표시용 문자열 (예: "1.2 MB")
  isActive: boolean;
  uploadedAt: string; // yyyy-MM-dd
}

// Swagger 공통 응답 봉투. 데이터는 항상 result 안에 있다.
// (auth.ts 의 지역 ApiEnvelope 와 동일 구조 — 이후 공유 지점으로 통합 가능)
export interface ApiEnvelope<T> {
  isSuccess: boolean;
  code: string;
  message?: string;
  result: T;
  errorDetail?: string[];
}
