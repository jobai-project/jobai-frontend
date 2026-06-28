import { useMutation } from '@tanstack/react-query';
import { uploadResume } from '@/api/resumes';

export function useUploadResume(onProgress?: (percent: number) => void) {
  return useMutation({
    mutationFn: (file: File) => uploadResume(file, onProgress),
  });
}
