import { useInfiniteQuery } from '@tanstack/react-query';
import { searchJobs } from '@/api/search';
import { normalizeSearchJob } from '@/api/normalizeJob';
import type { JobSummary, SearchInfo } from '@/types/jobApi';

const SIZE = 20; // 고정 상수 — 다음 페이지 계산(로드 수 vs totalCount)의 기준.

interface SearchPage {
  totalCount: number;
  jobs: JobSummary[];
  searchInfo: SearchInfo; // 데이터만 수신, 표시는 후속(§6 B구역).
}

// 자연어 검색 무한스크롤. page 0부터 누적, 로드한 총 개수가 totalCount 미만이면 다음 page.
// 홈 목록 훅(useInfiniteJobList)과 파라미터 체계가 달라 검색은 별도 훅으로 분리.
export function useJobSearch(query: string, enabled = true) {
  return useInfiniteQuery<SearchPage>({
    queryKey: ['searchJobs', query],
    initialPageParam: 0,
    enabled: enabled && query.trim().length > 0, // 빈 검색어면 미실행
    retry: false, // 401(세션 만료) 재시도 방지 — 전역 인터셉터가 상태 정리(axios.ts:41)
    queryFn: async ({ pageParam }) => {
      const result = await searchJobs(query, pageParam as number, SIZE);
      return {
        totalCount: result.totalCount,
        jobs: result.jobs.map(normalizeSearchJob),
        searchInfo: result.searchInfo,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((n, p) => n + p.jobs.length, 0);
      // 다음 page 인덱스 = 지금까지 받은 페이지 수. 더 남았을 때만.
      return loaded < lastPage.totalCount ? allPages.length : undefined;
    },
  });
}
