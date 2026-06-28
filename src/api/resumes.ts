import { apiClient } from './axios';

// 업로드 응답 (BE 스펙 확정 시 조정)
export interface ResumeUploadResponse {
  id: string;
  fileName: string;
  status: 'PENDING' | 'DONE' | 'FAIL';
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

/**
 * 이력서 PDF 업로드 (multipart).
 * @param onProgress 0~100 업로드 진행률 콜백 (LinearProgress용)
 */
export const uploadResume = async (
  file: File,
  onProgress?: (percent: number) => void,
): Promise<ResumeUploadResponse> => {
  // 개발용 목업: VITE_USE_MOCK 이 'false' 가 아니면 기본 동작.
  if (USE_MOCK) {
    for (let p = 0; p <= 100; p += 25) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      onProgress?.(p);
    }
    return { id: `mock-resume-${Date.now()}`, fileName: file.name, status: 'PENDING' };
  }

  const form = new FormData();
  form.append('file', file);

  const { data } = await apiClient.post<ResumeUploadResponse>('/resumes', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
  return data;
};
