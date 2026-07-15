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
    locations: string[];
    experiences: string[];
  };
}

interface ProfileSectionProps {
  user: UserProfile;
  onNameChange: (name: string) => void;
  onJobConditionsChange: (conditions: UserProfile['jobConditions']) => void;
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

  // 이력서: 서버 상태는 TanStack Query 훅으로 관리(B2 기존 패턴). 활성/삭제/업로드
  // 성공 시 각 훅의 onSuccess 가 ['resumes'] 무효화 → isActive 는 서버가 진실.
  const { data: resumeData, isLoading: resumesLoading } = useResumes();
  const upload = useUploadResume(setProgress);
  const activate = useActivateResume();
  const remove = useDeleteResume();

  // 백엔드가 최신순 반환하나 방어적으로 uploadedAt 내림차순 유지.
  const resumes = [...(resumeData ?? [])].sort((a, b) =>
    b.uploadedAt.localeCompare(a.uploadedAt),
  );

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
    // status 로 완료 판정하지 않는다 — 업로드 성공 = 목록 refetch 로 새 이력서를
    // isActive:true 로 다시 받아 표시(훅 onSuccess 의 invalidate).
    upload.mutate(file, {
      onError: () => setUploadError('업로드에 실패했어요. 다시 시도해 주세요.'),
    });
  };

  const handleDelete = (resumeId: number) => {
    // 복구 불가(S3 파일 동반 삭제) — 확인 절차 필수. 공통 모달 없어 window.confirm 대체(B4).
    if (!window.confirm('삭제하면 복구할 수 없어요. 삭제할까요?')) return;
    remove.mutate(resumeId);
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
            {/* 직무 - 가로 */}
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

            {/* 지역 - 가로 */}
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-400 min-w-12 mr-6">기업 형태</div>
              <div className="flex gap-2 flex-wrap">
                {user.jobConditions.locations.map((loc, idx) => (
                  <span key={idx} className="inline-block px-2.5 py-1.5 bg-[#F5F5FF] text-app-primary font-semibold text-xs rounded-[7px]">
                    {loc}
                  </span>
                ))}
              </div>
            </div>

            {/* 경력 - 드롭다운 */}
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
                  {/* 삭제 아이콘(팀원 디자인) — 서버 삭제로 연결(확인창 포함) */}
                  <button
                    onClick={() => handleDelete(resume.resumeId)}
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
                    {/* fileSize 는 이미 "1.2 MB" 문자열 — 다시 포맷하지 않는다. */}
                    <div className="text-sm font-normal text-gray-400">
                      {resume.fileSize} · {resume.uploadedAt}
                    </div>
                  </div>
                </div>

                {/* 활성 토글(팀원 디자인) — 비활성일 때만 서버 활성화 호출(중복 요청 방지) */}
                <button
                  onClick={() => {
                    if (!resume.isActive) activate.mutate(resume.resumeId);
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

        {/* 업로드 진행률 바 (onProgress 0~100) */}
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
    </div>
  );
}