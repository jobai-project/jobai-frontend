import { apiClient } from './axios';
import type { SearchJobsResult } from '@/types/jobApi';

// 자연어 공고 검색 (GET /api/search/jobs). 인증(accessToken 쿠키) 필수.
// baseURL 은 /api 미포함(axios.ts:33) → 전체경로 사용해도 이중 prefix 없음.
// envelope 는 자동 언랩되지 않으므로(axios.ts:39) res.data.result 수동 추출.
export async function searchJobs(
  query: string,
  page: number,
  size: number,
): Promise<SearchJobsResult> {
  const res = await apiClient.get<{ result: SearchJobsResult }>(
    '/api/search/jobs',
    { params: { query, page, size } },
  );
  return res.data.result;
}
