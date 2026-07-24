import {
  useInfiniteQuery,
  type UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { apiClient } from '@/api/axios';
import { normalizeJobSummary } from '@/api/normalizeJob';
import type { JobSummary, RawJobSummary } from '@/types/jobApi';
import type { CompanyType } from '@/types/job';

const SIZE = 18;

export interface JobListFilters {
  companyTypes?: CompanyType[]; // PUBLIC/PRIVATE 다중, 미지정 시 전체
  locations?: string[];
  employmentTypes?: string[];
}

// latest-jobs / recommended-jobs 의 result 형태 (envelope 안쪽)
interface RawJobListResult {
  totalCount: number;
  hasMore: boolean;
  jobs: RawJobSummary[];
}

interface JobListPage {
  totalCount: number;
  hasMore: boolean;
  jobs: JobSummary[];
}

// 공통 무한 목록 훅 — offset/size 페이지네이션 + 정규화.
// 게스트/회원 목록 API 는 matchScore 유무만 다르므로 endpoint 만 주입한다.
export function useInfiniteJobList(
  endpoint: string,
  filters: JobListFilters,
  // refetchInterval: 미전달 시 undefined → 폴링 안 함(검색 등 기존 호출부 무영향).
  options?: {
    enabled?: boolean;
    refetchInterval?: UseInfiniteQueryOptions<JobListPage>['refetchInterval'];
  },
) {
  return useInfiniteQuery<JobListPage>({
    queryKey: ['jobList', endpoint, filters],
    initialPageParam: 0,
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval,
    queryFn: async ({ pageParam }) => {
      // envelope 는 자동 언랩되지 않으므로(axios.ts:38-39) res.data.result 로 접근.
      const res = await apiClient.get<{ result: RawJobListResult }>(endpoint, {
        params: { ...filters, offset: pageParam, size: SIZE },
        // 배열은 companyTypes=A&companyTypes=B (반복형)로 직렬화 (A6).
        paramsSerializer: { indexes: null },
      });
      const result = res.data.result;
      return {
        totalCount: result.totalCount,
        hasMore: result.hasMore,
        jobs: result.jobs.map(normalizeJobSummary),
      };
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? (lastPageParam as number) + SIZE : undefined,
  });
}

// 게스트(인증 X)
export const useLatestJobs = (filters: JobListFilters) =>
  useInfiniteJobList('/api/v1/home/latest-jobs', filters);

// 회원(인증 O) — 비로그인 시 호출 안 되도록 enabled 가드.
// refetchInterval: 온보딩 직후 스코어링 대기 폴링용(HomePage에서 함수형 전달).
export const useRecommendedJobs = (
  filters: JobListFilters,
  enabled: boolean,
  refetchInterval?: UseInfiniteQueryOptions<JobListPage>['refetchInterval'],
) =>
  useInfiniteJobList('/api/v1/home/recommended-jobs', filters, {
    enabled,
    refetchInterval,
  });
