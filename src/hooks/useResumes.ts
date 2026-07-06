import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { activateResume, deleteResume, getResumes } from '@/api/resumes';

// 이력서 목록 조회
export function useResumes() {
  return useQuery({
    queryKey: ['resumes'],
    queryFn: getResumes,
  });
}

// 활성화 — 성공 시 목록 무효화로 isActive 갱신(문자열 result 는 사용 안 함)
export function useActivateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (resumeId: number) => activateResume(resumeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resumes'] }),
  });
}

// 삭제 — 복구 불가. 확인 모달 통과 후 호출. 성공 시 목록 무효화.
export function useDeleteResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (resumeId: number) => deleteResume(resumeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resumes'] }),
  });
}
