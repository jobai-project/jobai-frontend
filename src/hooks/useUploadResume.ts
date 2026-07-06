import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadResume } from '@/api/resumes';

export function useUploadResume(onProgress?: (percent: number) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadResume(file, onProgress),
    // 업로드 성공 시 새 이력서가 자동 활성화되므로 목록을 무효화 → isActive 최신화
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resumes'] }),
  });
}
