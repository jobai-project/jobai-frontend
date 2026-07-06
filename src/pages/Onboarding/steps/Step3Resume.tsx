import { Dispatch, DragEvent, useRef, useState } from 'react';
import { OnboardingState } from '../types';
import { OnboardingAction } from '../onboardingReducer';
import { useUploadResume } from '@/hooks/useUploadResume';

interface StepProps {
  state: OnboardingState;
  dispatch: Dispatch<OnboardingAction>;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// 업로드 날짜 표기용 yyyy.MM.dd (spec §5.1).
const formatYmd = (d: Date): string =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate(),
  ).padStart(2, '0')}`;

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
      onSuccess: (resumeId) => {
        // 업로드 API 는 resumeId(number)만 반환한다. 파일명은 로컬 File 에서,
        // 상태는 성공이므로 DONE 으로 세팅.
        setField('resumeId', resumeId);
        setField('resumeFileName', file.name);
        setField('resumeStatus', 'DONE');
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
    <div className="flex w-full flex-col gap-8 self-stretch">
      {/* 헤더 — Title 1 (spec §1 #1/#2): 28/600/140%/-0.56px/gray-900 #171F29 */}
      <h2 className="font-pretendard text-[28px] font-semibold leading-[140%] tracking-[-0.56px] text-[#171F29]">
        맞춤 공고 추천을 위해
        <br />
        이력서를 업로드 해주세요.
      </h2>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {isUploaded ? (
        // 업로드 후 §5.0: 점선 박스는 업로드 전/후 공통 유지(현재 버그 수정 — 내부 내용만 교체).
        // 빈 상태(§2)와 동일 컨테이너이며 정렬만 center → space-between (파일 항목 위 / "다시 업로드하기" 아래).
        <div className="flex h-[226px] flex-col items-center justify-between self-stretch rounded-xl border-2 border-dashed border-blue-500 bg-white/70 px-4 py-5">
          {/* 파일 항목 §5.1: p12/20, gap24, radius12, bg blue-100 #EBECFF */}
          <div className="flex items-center gap-6 self-stretch rounded-xl bg-blue-100 px-5 py-3">
            {/* 완료 아이콘 afterpdf.svg ~24px (§5.1) */}
            <img src="/afterpdf.svg" alt="" aria-hidden className="h-6 w-6 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col">
              {/* 파일명 18px / 600 / gray-900 (§5.2 ⚠️ 굵기·색상은 가정) */}
              <div className="truncate font-pretendard text-[18px] font-semibold text-[#171F29]">
                {state.resumeFileName}
              </div>
              {/* 업로드 날짜 14px / 400 / gray-600 (§5.2 ⚠️).
                  TODO(백엔드 연동 필요): 날짜는 서버 응답값 사용. 지금은 클라이언트 현재일. */}
              <div className="font-pretendard text-sm font-normal text-[#687685]">
                업로드 날짜: {formatYmd(new Date())}
              </div>
            </div>
          </div>
          {/* 하단 액션 §5.3: 업로드 아이콘 + "다시 업로드하기" */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 self-start font-pretendard text-sm font-semibold text-app-primary hover:opacity-80"
          >
            <img src="/upload-icon.png" alt="" aria-hidden className="h-4 w-4" />
            다시 업로드하기
          </button>
        </div>
      ) : (
        // 빈 드롭존 (spec §1 #3~#6): h226, p20/16, gap36, radius12, 2px dashed blue-500, bg 70%
        <div
          onClick={() => !isUploading && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          className={`flex h-[226px] cursor-pointer flex-col items-center justify-center gap-9 self-stretch rounded-xl border-2 border-dashed border-blue-500 px-4 py-5 text-center transition-colors ${
            dragActive ? 'bg-blue-100/60' : 'bg-white/70'
          }`}
        >
          {/* 빈 드롭존 아이콘 — pdf.svg, 크기 확정 82.468×103.75px (spec §2.1) */}
          <img
            src="/pdf.svg"
            alt=""
            aria-hidden
            className="object-contain"
            style={{ width: '82.468px', height: '103.75px' }}
          />
          {/* 안내 텍스트 — PDF 업로드 (#5) */}
          <p className="font-pretendard text-sm font-medium text-[#303D4C]">
            {isUploading ? '업로드 중...' : 'PDF 업로드'}
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
