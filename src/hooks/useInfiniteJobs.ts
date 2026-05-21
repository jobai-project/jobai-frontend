import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchJobs, type FetchJobsResponse } from '@/api/jobs';
import type { CompanyType } from '@/types/job';

interface UseInfiniteJobsOptions {
  companyType?: CompanyType;
  q?: string;
}

export const useInfiniteJobs = ({ companyType, q }: UseInfiniteJobsOptions) => {
  return useInfiniteQuery<FetchJobsResponse, Error>({
    queryKey: ['jobs', { companyType, q }],
    queryFn: ({ pageParam }) =>
      fetchJobs({
        cursor: pageParam as string | undefined,
        companyType,
        q,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 1000 * 60,
  });
};
