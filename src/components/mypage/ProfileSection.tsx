import { useState, useRef } from 'react';
import JobConditionsEditor from '@/components/mypage/JobConditionsEditor';
import { useResumes, useActivateResume, useDeleteResume } from '@/hooks/useResumes';
import { useUploadResume } from '@/hooks/useUploadResume';
import ProfileBox from '@/components/mypage/ProfileBox';
import { handleWithdraw } from '@/api/member';

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
  onNameChange: (name: string) => Promise<void>;
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

// 회원 탈퇴 확인 모달 - ResumeConfirmModal(위) 복제. filename 배지 제거 + 안내 문구(D6) 필수.
// isPending: 탈퇴 요청 중 확인/취소/오버레이를 모두 잠가 중복 DELETE·중도 닫힘을 막는다.
// ESC·초기 포커스 제어는 ResumeConfirmModal과 동일하게 미지원(범위 밖).
function WithdrawConfirmModal({
  title,
  description,
  confirmLabel,
  cancelLabel,
  isPending,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center"
      onClick={isPending ? undefined : onCancel} // 요청 중에는 오버레이 클릭 무시
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 w-[420px] shadow-xl flex flex-col items-center"
      >
        <h3 className="text-center text-lg font-bold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-center text-sm text-gray-500 mb-7 whitespace-pre-line">
          {description}
        </p>

        <button
          onClick={onConfirm}
          disabled={isPending}
          className="w-[324px] h-[45px] py-3 mb-2 rounded-xl bg-[#F36975] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {confirmLabel}
        </button>
        <button
          onClick={onCancel}
          disabled={isPending}
          className="w-[324px] h-[45px] py-3 rounded-xl bg-gray-100 text-app-text-muted font-semibold hover:bg-app-hover transition-colors disabled:opacity-50"
        >
          {cancelLabel}
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

  // 회원 탈퇴 — handleWithdraw는 모듈 함수(useMutation 아님)라 pending을 자체 추적한다.
  // 이력서 삭제는 useDeleteResume().isPending을 쓰지만, 탈퇴는 훅이 아니므로 useState로 맞춘다.
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdrawConfirm = async () => {
    if (isWithdrawing) return; // 🔴 중복 클릭 = 중복 DELETE 방지
    setIsWithdrawing(true);
    try {
      await handleWithdraw(); // 성공 시 페이지가 통째로 교체됨(window.location.replace)
    } catch {
      // 🔴 실패 = 계정이 아직 살아 있음. 화면 이동 없음, 모달 재조작 가능하게 복구.
      setIsWithdrawing(false);
      setWithdrawOpen(false);
      showToast('탈퇴 처리에 실패했어요. 잠시 후 다시 시도해 주세요.');
    }
    // 성공 경로에서는 setIsWithdrawing(false)를 호출하지 않는다(언마운트 후 setState 경고 방지).
  };

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
        onWithdrawClick={() => setWithdrawOpen(true)}
        isWithdrawing={isWithdrawing}
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

      {/* 회원 탈퇴 확인 모달 (D6 — 삭제 대상 안내 문구 필수) */}
      {withdrawOpen && (
        <WithdrawConfirmModal
          title="탈퇴하시겠습니까?"
          description={
            '탈퇴하면 이력서, 스크랩, 지원 내역,\n알림 설정이 모두 삭제되며\n복구할 수 없습니다.'
          }
          confirmLabel="예"
          cancelLabel="아니오"
          isPending={isWithdrawing}
          onConfirm={handleWithdrawConfirm}
          onCancel={() => setWithdrawOpen(false)}
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