import { Dispatch, DragEvent, useRef, useState } from 'react';
import { OnboardingState } from '../types';
import { OnboardingAction } from '../onboardingReducer';
import { useUploadResume } from '@/hooks/useUploadResume';

interface StepProps {
  state: OnboardingState;
  dispatch: Dispatch<OnboardingAction>;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function Step3Resume({ state, dispatch }: StepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const upload = useUploadResume(setProgress);

  const setField = (key: keyof OnboardingState, value: OnboardingState[keyof OnboardingState]) =>
    dispatch({ type: 'SET_FIELD', key, value });

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);

    if (file.type !== 'application/pdf') {
      setError('PDF 파일만 업로드할 수 있어요.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('파일 크기는 5MB 이하여야 해요.');
      return;
    }

    setProgress(0);
    setField('resumeStatus', 'UPLOADING');
    upload.mutate(file, {
      onSuccess: (res) => {
        setField('resumeId', res.id);
        setField('resumeFileName', res.fileName);
        setField('resumeStatus', res.status);
      },
      onError: () => {
        setError('업로드에 실패했어요. 다시 시도해 주세요.');
        setField('resumeStatus', 'FAIL');
      },
    });
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const isUploading = state.resumeStatus === 'UPLOADING';
  const isUploaded =
    state.resumeStatus === 'PENDING' || state.resumeStatus === 'DONE';

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-app-text mb-1">이력서 업로드</h3>
        <p className="text-xs text-app-text-muted">PDF 형식, 5MB 이하</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {isUploaded ? (
        // 업로드 완료 상태
        <div className="border border-app-border rounded-lg p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div>
              <div className="text-sm font-medium text-app-text">
                {state.resumeFileName}
              </div>
              <div className="text-xs text-app-text-muted">업로드 완료</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-sm font-semibold text-app-primary hover:opacity-80"
          >
            다시 업로드하기
          </button>
        </div>
      ) : (
        // 드롭존
        <div
          onClick={() => !isUploading && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-app-primary bg-app-bg'
              : 'border-app-border hover:bg-app-bg'
          }`}
        >
          <div className="text-3xl mb-2">⬆️</div>
          <p className="text-sm text-app-text">
            {isUploading
              ? '업로드 중...'
              : '여기로 파일을 끌어다 놓거나 클릭하여 선택하세요'}
          </p>
        </div>
      )}

      {/* 진행률 */}
      {isUploading && (
        <div className="h-1 w-full bg-app-border rounded-full overflow-hidden">
          <div
            className="h-full bg-app-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
