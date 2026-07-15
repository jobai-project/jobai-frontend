import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyPageInfo, updateJobPreferences } from '@/api/member';

// 마이페이지(E1)·희망조건(E3). staleTime 은 main.tsx 전역 60초 사용.
export const memberKeys = { me: ['member', 'me'] as const };

export const useMyPageInfo = () =>
  useQuery({ queryKey: memberKeys.me, queryFn: getMyPageInfo });

export const useUpdateJobPreferences = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateJobPreferences,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: memberKeys.me });
      qc.invalidateQueries({ queryKey: ['jobList'] }); // 조건 변경 → 추천 결과 변경
    },
  });
};
