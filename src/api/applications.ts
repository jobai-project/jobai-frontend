import { apiClient } from '@/api/axios';
import type {
  ApiEnvelope,
  ApplicationsListResponse,
  ApplicationSummary,
  CreateApplicationPayload,
  CreateApplicationResponse,
  UpcomingInterview,
  UpdateApplicationPayload,
} from '@/types/application';

export const getApplications = async (): Promise<ApplicationsListResponse> => {
  const { data } = await apiClient.get<ApiEnvelope<ApplicationsListResponse>>(
    '/api/v1/applications',
  );
  return data.result;
};

export const createApplication = async (
  payload: CreateApplicationPayload,
): Promise<CreateApplicationResponse> => {
  const { data } = await apiClient.post<ApiEnvelope<CreateApplicationResponse>>(
    '/api/v1/applications',
    payload,
  );
  return data.result;
};

export const updateApplication = async (
  applicationId: number,
  payload: UpdateApplicationPayload,
): Promise<void> => {
  await apiClient.patch<ApiEnvelope<string>>(
    `/api/v1/applications/${applicationId}`,
    payload,
  );
};

export const deleteApplication = async (applicationId: number): Promise<void> => {
  await apiClient.delete<ApiEnvelope<string>>(
    `/api/v1/applications/${applicationId}`,
  );
};

// 지원 현황 요약(도넛: 평균 진행도 + 계산대상 건수)
export const getApplicationSummary = async (): Promise<ApplicationSummary> => {
  const { data } = await apiClient.get<ApiEnvelope<ApplicationSummary>>(
    '/api/v1/applications/summary',
  );
  return data.result;
};

// 다가오는 일정(면접 D-day, 서버가 정렬·최대 3·null 제외 처리)
export const getUpcomingInterviews = async (): Promise<UpcomingInterview[]> => {
  const { data } = await apiClient.get<
    ApiEnvelope<{ schedules: UpcomingInterview[] }>
  >('/api/v1/applications/upcoming');
  return data.result.schedules;
};