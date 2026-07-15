import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createApplication,
  deleteApplication,
  getApplications,
  getApplicationSummary,
  getUpcomingInterviews,
  updateApplication,
} from '@/api/applications';
import type {
  CreateApplicationPayload,
  UpdateApplicationPayload,
} from '@/types/application';

// 요약·일정 키는 ['applications'] 하위 → CRUD 뮤테이션의
// invalidateQueries({ queryKey: ['applications'] }) 가 prefix 매칭으로 함께 갱신한다.
const APPLICATIONS_QUERY_KEY = ['applications'] as const;

export const useApplications = () => {
  return useQuery({
    queryKey: APPLICATIONS_QUERY_KEY,
    queryFn: getApplications,
  });
};

export const useApplicationSummary = () => {
  return useQuery({
    queryKey: [...APPLICATIONS_QUERY_KEY, 'summary'],
    queryFn: getApplicationSummary,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpcomingInterviews = () => {
  return useQuery({
    queryKey: [...APPLICATIONS_QUERY_KEY, 'upcoming'],
    queryFn: getUpcomingInterviews,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateApplicationPayload) => createApplication(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
    },
  });
};

export const useUpdateApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      applicationId,
      payload,
    }: {
      applicationId: number;
      payload: UpdateApplicationPayload;
    }) => updateApplication(applicationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
    },
  });
};

export const useDeleteApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: number) => deleteApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
    },
  });
};