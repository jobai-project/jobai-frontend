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

// 스크랩 → 지원현황 자동 채움 전용. useJobDetail과 같은 엔드포인트·정규화
// 로직이지만, 훅이 아니라 일반 함수라 이벤트 핸들러 안에서 한 번만 호출할 때 쓴다.
export async function fetchJobDetailOnce(
  source: CompanyType,
  id: number,
): Promise<JobDetail> {
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
}

// 정규화된 JobDetail에서 직무 카테고리만 뽑아온다.
// PrivateJobDetail은 jobCategory, PublicJobDetail은 jobRole 필드에 들어있다.
export async function fetchJobPositionLabel(
  source: CompanyType,
  id: number,
): Promise<string> {
  const detail = await fetchJobDetailOnce(source, id);
  if (detail.source === 'PRIVATE') {
    return detail.jobCategory ?? '';
  }
  return detail.jobRole ?? '';
}