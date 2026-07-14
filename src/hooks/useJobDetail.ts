import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/axios';
import {
  normalizePrivateJobDetail,
  normalizePublicJobDetail,
} from '@/api/normalizeJob';
import type {
  JobDetail,
  RawPrivateJobDetail,
  RawPublicJobDetail,
} from '@/types/jobApi';
import type { CompanyType } from '@/types/job';

// source 로 엔드포인트·정규화 함수를 분기한다. id 만으로는 사기업/공공 구분 불가.
// envelope 는 자동 언랩되지 않으므로(axios.ts:39) res.data.result 로 접근.
export function useJobDetail(source: CompanyType | undefined, id: number) {
  return useQuery<JobDetail>({
    queryKey: ['jobDetail', source, id],
    enabled: Number.isFinite(id) && (source === 'PUBLIC' || source === 'PRIVATE'),
    queryFn: async () => {
      if (source === 'PRIVATE') {
        const res = await apiClient.get<{ result: RawPrivateJobDetail }>(
          `/api/v1/private-jobs/${id}`,
        );
        return normalizePrivateJobDetail(res.data.result);
      }
      const res = await apiClient.get<{ result: RawPublicJobDetail }>(
        `/api/v1/public-jobs/${id}`,
      );
      return normalizePublicJobDetail(res.data.result);
    },
  });
}
