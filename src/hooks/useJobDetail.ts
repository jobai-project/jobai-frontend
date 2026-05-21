import { useQuery } from '@tanstack/react-query';
import { fetchJobDetail } from '@/api/jobs';

export const useJobDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => fetchJobDetail(id!),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
};
