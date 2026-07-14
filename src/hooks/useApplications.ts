import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createApplication,
  deleteApplication,
  getApplications,
  updateApplication,
} from '@/api/applications';
import type {
  CreateApplicationPayload,
  UpdateApplicationPayload,
} from '@/types/application';

const APPLICATIONS_QUERY_KEY = ['applications'] as const;

export const useApplications = () => {
  return useQuery({
    queryKey: APPLICATIONS_QUERY_KEY,
    queryFn: getApplications,
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