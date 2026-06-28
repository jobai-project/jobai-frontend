import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchJobs, type FetchJobsResponse } from '@/api/jobs';
import type { CompanyType } from '@/types/job';
import type { UserCondition } from '@/utils/conditionStorage';

interface UseInfiniteJobsOptions {
  companyType?: CompanyType;
  q?: string;
  condition?: UserCondition | null;
}

export const useInfiniteJobs = ({
  companyType,
  q,
  condition,
}: UseInfiniteJobsOptions) => {
  return useInfiniteQuery<FetchJobsResponse, Error>({
    // condition 이 바뀌면 자동 refetch 되도록 queryKey 에 포함
    queryKey: ['jobs', { companyType, q, condition }],
    queryFn: ({ pageParam }) =>
      fetchJobs({
        cursor: pageParam as string | undefined,
        companyType,
        q,
        condition,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 1000 * 60,
  });
};
