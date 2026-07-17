import { useState } from 'react';
import EditableField from '@/components/mypage/EditableField';

interface ProfileBoxProps {
  name: string;
  email: string;
  // 저장 성공/실패를 ProfileBox가 알아야 같은 자리에 에러를 띄우고, 실패 시
  // 수정 상태를 유지할 수 있다. 실패하면 reject(에러 메시지)한다.
  onNameChange: (name: string) => Promise<void>;
}

export default function ProfileBox({ name, email, onNameChange }: ProfileBoxProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = tempName.trim();

    if (!trimmed) {
      setNameError('이름은 공백일 수 없어요.');
      return;
    }
    if (trimmed.length > 20) {
      setNameError('이름은 최대 20자까지 입력할 수 있어요.');
      return;
    }

    setNameError(null);
    setIsSaving(true);
    try {
      await onNameChange(tempName);
      setIsEditing(false);
    } catch (err) {
      // 서버 저장 실패(API 에러) — 같은 자리(구분선 바로 밑)에 표시하고 수정 상태 유지
      setNameError(
        err instanceof Error ? err.message : '이름 수정에 실패했어요. 다시 시도해주세요.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTempName(name);
    setNameError(null);
    setIsEditing(false);
  };

  return (
    <div className="w-[700px] border border-[#EBECFF]/90 rounded-2xl p-6 bg-white shadow-[0_4px_12px_rgba(124,119,255,0.08)]">
      <div className="flex items-center gap-1.5 mb-4">
        <h2 className="font-semibold text-[16px] text-app-text">프로필</h2>
        {!isEditing && (
          <EditableField onEdit={() => setIsEditing(true)} iconSrc="/edit-icon.png" />
        )}
      </div>

      <div className="flex items-start gap-5">
        <img src="/profile-icon.png" alt="프로필" className="w-16 h-16 rounded-full" />
        <div className="flex-1 space-y-4">
          {/* 이름 */}
          <div className="flex items-center gap-2">
            <div className="text-sm font-normal text-gray-400 min-w-12">이름</div>
            {isEditing ? (
              <input
                type="text"
                value={tempName}
                onChange={(e) => {
                  setTempName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                className="w-[88px] px-3 py-1.5 border border-app-border rounded-[8px] text-sm"
                autoFocus
              />
            ) : (
              <div className="text-sm font-medium text-app-text">{name}</div>
            )}
          </div>

          {/* 이메일 */}
          <div className="flex items-center gap-2">
            <div className="text-sm font-normal text-gray-400 min-w-12">이메일</div>
            <div className="text-sm font-medium text-app-text">{email}</div>
          </div>
        </div>
      </div>

      {/* 편집 모드일 때만 하단 구분선 + 에러 메시지 + 취소/저장 버튼 */}
      {isEditing && (
        <>
          <div className="border-t border-gray-200 mt-5 mb-2" />
          {nameError && (
            <p className="text-xs text-red-500 mb-2">{nameError}</p>
          )}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="h-[30px] flex flex-col justify-center px-4 py-2 text-xs font-semibold text-gray-500 bg-app-bg border border-app-border rounded-[10px] hover:bg-app-hover transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 flex flex-col justify-center text-xs font-semibold text-white bg-app-primary rounded-[10px] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}