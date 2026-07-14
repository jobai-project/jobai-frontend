import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/axios';
import type { JobLlmSummary } from '@/types/jobApi';

interface JobSummaryResponse {
  jobPostingId: number;
  title: string;
  company: string;
  applyUrl: string;
  summary: JobLlmSummary;
}

// 온디맨드 LLM 요약 (사기업 전용). enabled:false → 자동 호출 안 함, 버튼 클릭 시 refetch().
// 첫 호출은 LLM 생성이라 느릴 수 있고, 이후 캐시 반환이라 staleTime:Infinity 로 재요청 방지.
export function useJobSummary(id: number) {
  return useQuery<JobSummaryResponse>({
    queryKey: ['jobSummary', id],
    enabled: false,
    staleTime: Infinity,
    queryFn: async () => {
      const res = await apiClient.get<{ result: JobSummaryResponse }>(
        `/api/v1/private-jobs/${id}/summary`,
      );
      return res.data.result;
    },
  });
}
