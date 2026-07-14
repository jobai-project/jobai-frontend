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

// 공통 응답 래퍼
export interface ApiEnvelope<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}