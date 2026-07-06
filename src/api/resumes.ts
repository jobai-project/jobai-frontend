import { apiClient } from './axios';
import type { ApiEnvelope, ResumeItem } from '@/types/resume';

// 이력서 API — 공통 응답 봉투(result) 를 각 함수가 직접 벗긴다.
// (axios 인터셉터는 봉투를 벗기지 않음 — axios.ts:38-39, auth.ts 선례)

// 목록 조회 — result 는 객체 { resumes: ResumeItem[] }
export const getResumes = async (): Promise<ResumeItem[]> => {
  const res = await apiClient.get<ApiEnvelope<{ resumes: ResumeItem[] }>>(
    '/api/v1/members/resumes',
  );
  return res.data.result.resumes;
};

/**
 * 이력서 PDF 업로드 (multipart). 성공 시 새 이력서가 자동 활성화되고
 * 기존 활성 이력서는 자동 비활성화된다.
 * @param onProgress 0~100 업로드 진행률 콜백 (LinearProgress용)
 * @returns 생성된 resumeId (number)
 */
export const uploadResume = async (
  file: File,
  onProgress?: (percent: number) => void,
): Promise<number> => {
  const form = new FormData();
  form.append('file', file);

  // Content-Type 은 수동 지정하지 않는다. 브라우저가 multipart boundary 를
  // 포함해 자동 설정하게 둔다(수동 지정 시 boundary 누락으로 서버 파싱 실패).
  const res = await apiClient.post<ApiEnvelope<{ resumeId: number }>>(
    '/api/v1/members/resumes',
    form,
    {
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    },
  );
  return res.data.result.resumeId;
};

// 활성화 — 기존 활성 이력서는 자동 비활성화된다.
// result 는 안내 문자열이라 파싱하지 않는다. 성공 후 목록 refetch 로 isActive 갱신.
export const activateResume = async (resumeId: number): Promise<void> => {
  await apiClient.patch(`/api/v1/members/resumes/${resumeId}/activate`);
};

// 삭제 — 복구 불가(S3 파일 동반 삭제). 호출 전 확인 모달은 컴포넌트 책임.
// result 는 안내 문자열이라 파싱하지 않는다.
export const deleteResume = async (resumeId: number): Promise<void> => {
  await apiClient.delete(`/api/v1/members/resumes/${resumeId}`);
};
