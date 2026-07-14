import { apiClient } from '@/api/axios';
import type {
  ApiEnvelope,
  ApplicationsListResponse,
  CreateApplicationPayload,
  CreateApplicationResponse,
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