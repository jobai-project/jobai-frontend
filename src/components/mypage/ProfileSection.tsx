import { useState, useRef } from 'react';
import JobConditionsEditor from '@/components/mypage/JobConditionsEditor';
import { useResumes, useActivateResume, useDeleteResume } from '@/hooks/useResumes';
import { useUploadResume } from '@/hooks/useUploadResume';
import ProfileBox from '@/components/mypage/ProfileBox';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

interface UserProfile {
  name: string;
  email: string;
  jobConditions: {
    positions: string[];
    jobCategories: string[];
    experiences: string[];
  };
}

interface ProfileSectionProps {
  user: UserProfile;
  onNameChange: (name: string) => void;
  onJobConditionsChange: (conditions: UserProfile['jobConditions']) => void;
}

// 이력서 활성 변경 / 삭제 공용 확인 모달 - 지원 현황 페이지의 DeleteConfirmModal과 동일한 디자인
function ResumeConfirmModal({
  filename,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  filename: string;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 w-[420px] h-[272px] shadow-xl flex flex-col items-center"
      >
        <div className="flex justify-center mb-3">
          <span className="px-3 py-1 rounded-[99px] bg-[#F5F5FF] text-app-primary text-xs font-semibold">
            {filename}
          </span>
        </div>

        <h3 className="text-center text-lg font-bold text-gray-900 mb-1">
          {title}
        </h3>
        <p className="text-center text-sm text-gray-500 mb-7">
          {description}
        </p>

        <button
          onClick={onConfirm}
          className="w-[324px] h-[45px] py-3 mb-2 rounded-xl bg-app-primary text-white font-semibold hover:opacity-90 transition-opacity"
        >
          {confirmLabel}
        </button>
        <button
          onClick={onCancel}
          className="w-[324px] h-[45px] py-3 rounded-xl bg-gray-100 text-app-text-muted font-semibold hover:bg-app-hover transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  );
}

export default function ProfileSection({
  user,
  onNameChange,
  onJobConditionsChange,
}: ProfileSectionProps) {
  const [editingJobConditions, setEditingJobConditions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [activateTargetId, setActivateTargetId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const { data: resumeData, isLoading: resumesLoading } = useResumes();
  const upload = useUploadResume(setProgress);
  const activate = useActivateResume();
  const remove = useDeleteResume();

  const resumes = [...(resumeData ?? [])].sort((a, b) =>
    b.uploadedAt.localeCompare(a.uploadedAt),
  );

  const activateTarget = resumes.find((r) => r.resumeId === activateTargetId);
  const deleteTarget = resumes.find((r) => r.resumeId === deleteTargetId);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    if (file.type !== 'application/pdf') {
      setUploadError('PDF 파일만 업로드할 수 있어요.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setUploadError('5MB 이하만 업로드할 수 있어요.');
      return;
    }
    setProgress(0);
    upload.mutate(file, {
      onError: () => setUploadError('업로드에 실패했어요. 다시 시도해 주세요.'),
    });
  };

  return (
    <div className="space-y-6">
      {/* 프로필 섹션 */}
      <ProfileBox
        name={user.name}
        email={user.email}
        onNameChange={onNameChange}
      />

      {/* 공고 조건 설정 */}
      <div className="w-[700px] flex flex-col justify-center border border-[#EBECFF]/90 rounded-2xl p-6 bg-white shadow-[0_4px_12px_rgba(124,119,255,0.08)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-[16px] text-app-text">공고 조건 설정</h2>
            <button
              onClick={() => setEditingJobConditions(!editingJobConditions)}
              className="p-0 hover:opacity-80"
            >
              <img src="/edit-icon.png" alt="수정" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {editingJobConditions ? (
          <JobConditionsEditor
            conditions={user.jobConditions}
            onSave={(conditions) => {
              onJobConditionsChange(conditions);
              setEditingJobConditions(false);
            }}
            onCancel={() => setEditingJobConditions(false)}
          />
        ) : (
          <div className="space-y-4">
            {/* 지역 - 가로 */}
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-400 min-w-12 mr-6">지역</div>
              <div className="flex gap-[6px] flex-wrap">
                {user.jobConditions.positions.map((pos, idx) => (
                  <span key={idx} className="inline-block px-2.5 py-1.5 bg-[#F5F5FF] text-app-primary font-semibold text-xs rounded-[7px]">
                    {pos}
                  </span>
                ))}
              </div>
            </div>

            {/* 희망 직무 - 가로 */}
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-400 min-w-12 mr-6">희망 직무</div>
              <div className="flex gap-2 flex-wrap">
                {user.jobConditions.jobCategories.map((cat, idx) => (
                  <span key={idx} className="inline-block px-2.5 py-1.5 bg-[#F5F5FF] text-app-primary font-semibold text-xs rounded-[7px]">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* 고용 형태 - 가로 */}
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-400 min-w-12 mr-6">고용 형태</div>
              <div className="flex gap-2 flex-wrap">
                {user.jobConditions.experiences.map((exp, idx) => (
                  <span key={idx} className="inline-block px-2.5 py-1.5 bg-[#F5F5FF] text-app-primary font-semibold text-xs rounded-[7px]">
                    {exp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 이력서 관리 — 팀원 디자인 그대로, 서버 훅으로 연결 */}
      <div className="w-[700px] min-h-[145px] flex flex-col border border-[#EBECFF]/90 rounded-2xl p-6 bg-white shadow-[0_4px_12px_rgba(124,119,255,0.08)]">
        <div className="flex items-center gap-1.5 mb-6">
          <h2 className="font-semibold text-[16px] text-app-text">이력서 관리</h2>
        </div>

        <div className="space-y-3">
          {resumesLoading ? (
            <div className="text-sm text-gray-400">불러오는 중...</div>
          ) : resumes.length === 0 ? (
            <div className="text-sm text-gray-400">등록된 이력서가 없어요.</div>
          ) : (
            resumes.map((resume) => (
              <div key={resume.resumeId} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDeleteTargetId(resume.resumeId)}
                    disabled={remove.isPending}
                    className="p-0 hover:opacity-80 disabled:opacity-50"
                  >
                    <img src="/delete-gray-icon.png" alt="삭제" className="w-6 h-6" />
                  </button>

                  {resume.isActive ? (
                    <img src="/submit-icon.png" alt="활성" className="w-11 h-11" />
                  ) : (
                    <img src="/submit-no-icon.png" alt="비활성" className="w-11 h-11" />
                  )}

                  <div>
                    <div className="text-sm font-medium text-gray-800 mb-2">
                      {resume.originalFilename}
                    </div>
                    <div className="text-sm font-normal text-gray-400">
                      {resume.fileSize} · {resume.uploadedAt}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!resume.isActive) setActivateTargetId(resume.resumeId);
                  }}
                  disabled={activate.isPending}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-[7px] transition-colors disabled:opacity-50 ${
                    resume.isActive
                      ? 'bg-[#F5F5FF] text-blue-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-app-hover'
                  }`}
                >
                  {resume.isActive ? '활성' : '활성으로 변경'}
                </button>
              </div>
            ))
          )}
        </div>

        {upload.isPending && (
          <div className="mt-4 h-1 w-full bg-app-border rounded-full overflow-hidden">
            <div
              className="h-full bg-app-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={upload.isPending}
          className="flex items-center justify-center gap-2 w-full mt-4 py-2 border-2 border-dashed border-app-border rounded-[12px] font-semibold text-sm text-gray-300 hover:bg-app-bg transition-colors disabled:opacity-50"
        >
          <img src="/upload-icon.png" alt="업로드" className="w-4 h-4" />
          <span>{upload.isPending ? '업로드 중...' : 'PDF 업로드'}</span>
        </button>

        {uploadError && <p className="mt-2 text-xs text-red-500">{uploadError}</p>}

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="hidden"
        />
      </div>

      {/* 활성 변경 확인 모달 */}
      {activateTarget && (
        <ResumeConfirmModal
          filename={activateTarget.originalFilename}
          title="이력서를 변경할까요?"
          description="기존 활성 이력서는 비활성으로 변경돼요."
          confirmLabel="변경"
          onConfirm={() => {
            activate.mutate(activateTarget.resumeId, {
              onSuccess: () => showToast('활성 이력서를 변경했어요'),
            });
            setActivateTargetId(null);
          }}
          onCancel={() => setActivateTargetId(null)}
        />
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <ResumeConfirmModal
          filename={deleteTarget.originalFilename}
          title="이력서를 삭제할까요?"
          description="삭제한 이력서는 복구할 수 없어요."
          confirmLabel="삭제"
          onConfirm={() => {
            remove.mutate(deleteTarget.resumeId, {
              onSuccess: () => showToast('이력서를 삭제했어요'),
            });
            setDeleteTargetId(null);
          }}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}

      {/* 완료 토스트 */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] bg-gray-500 text-white text-sm font-medium px-4 py-2.5 rounded-[25px] shadow-lg whitespace-nowrap">
          {toastMessage}
        </div>
      )}
    </div>
  );
}