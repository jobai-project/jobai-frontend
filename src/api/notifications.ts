import { apiClient } from '@/api/axios';
import type { ApiEnvelope } from '@/api/auth';
import type { NotificationMatchesResult } from '@/types/notification';

// GET /api/v1/notifications/matches/{batchId}
export const getNotificationMatches = async (
  batchId: number,
): Promise<NotificationMatchesResult> => {
  const res = await apiClient.get<ApiEnvelope<NotificationMatchesResult>>(
    `/api/v1/notifications/matches/${batchId}`,
  );
  return res.data.result;
};