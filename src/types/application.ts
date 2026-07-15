import type { ApplicationStatus } from '@/utils/applicationStatusMapping';

// GET /api/v1/applications 응답의 개별 항목
export interface ApplicationApiItem {
  applicationId: number;
  companyName: string;
  jobTitle: string;
  status: ApplicationStatus;
  statusLabel: string;
  appliedAt: string | null; // yyyy-MM-dd
  interviewAt: string | null; // yyyy-MM-dd
  memo: string | null;
}

export interface ApplicationsListResponse {
  applications: ApplicationApiItem[];
}

// POST /api/v1/applications 요청 바디
export interface CreateApplicationPayload {
  companyName: string;
  jobTitle: string;
  status: ApplicationStatus;
  appliedAt?: string | null;
  interviewAt?: string | null;
  memo?: string | null;
}

export interface CreateApplicationResponse {
  applicationId: number;
}

// PATCH /api/v1/applications/{id} 요청 바디 - 전부 선택 입력(부분 수정)
export interface UpdateApplicationPayload {
  companyName?: string;
  jobTitle?: string;
  status?: ApplicationStatus;
  appliedAt?: string | null;
  interviewAt?: string | null;
  memo?: string | null;
}

// GET /api/v1/applications/summary
export interface ApplicationSummary {
  /** 0~100 평균 진행도. 탈락·예정 제외. ⚠️ double/int·반올림은 백엔드 확인(G4) */
  averageProgress: number;
  /** 진행도 계산에 포함된 지원 수(탈락·예정 제외). ⚠️ 디자인 "총 지원"과 다름(G1) */
  totalCalculatedCount: number;
}

// GET /api/v1/applications/upcoming (result.schedules 원소)
export interface UpcomingInterview {
  applicationId: number;
  companyName: string;
  jobTitle: string;
  interviewAt: string; // "yyyy-MM-dd"
  daysLeft: number; // 0 = D-Day (서버 계산, 프론트 재계산 금지)
}

// 공통 응답 래퍼
export interface ApiEnvelope<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}