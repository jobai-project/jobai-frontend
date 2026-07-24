import { useQuery } from '@tanstack/react-query';
import { getNotificationMatches } from '@/api/notifications';

export const useNotificationMatches = (batchId: number | undefined) => {
  return useQuery({
    queryKey: ['notificationMatches', batchId],
    queryFn: () => getNotificationMatches(batchId as number),
    enabled: batchId !== undefined && !Number.isNaN(batchId),
  });
};