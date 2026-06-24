import { useState } from 'react';
import EditableField from '@/components/mypage/EditableField';
import JobConditionsEditor from '@/components/mypage/JobConditionsEditor';

interface UserProfile {
  name: string;
  email: string;
  jobConditions: {
    positions: string[];
    locations: string[];
    experiences: string[];
  };
  resumes: Array<{
    id: string;
    name: string;
    date: string;
    status: 'primary' | 'secondary';
  }>;
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

  return (
    <div className="space-y-6">
      {/* 프로필 섹션 */}
      <div className="border border-app-border rounded-lg p-6 bg-white">
        <h2 className="font-semibold text-app-text mb-6">프로필</h2>

        <div className="flex items-start gap-4 mb-6 pb-6">
          <img src="/profile-icon.png" alt="프로필" className="w-16 h-16 rounded-full" />
          <div className="flex-1 space-y-4">
            <div className="flex items-center">
              <div className="flex items-center gap-4">
                <div className="text-xs text-app-text-muted min-w-12">이름</div>
                <div className="flex items-center gap-0">
                  <div className="text-sm font-medium text-app-text">{user.name}</div>
                  <EditableField value={user.name} onSave={onNameChange} label="이름" iconSrc="/edit-icon.png" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs text-app-text-muted min-w-12">이메일</div>
              <div className="text-sm text-app-text">{user.email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 공고 조건 설정 */}
      <div className="border border-app-border rounded-lg p-6 bg-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5">
            <h2 className="font-semibold text-app-text">공고 조건 설정</h2>
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
              <div className="text-xs text-app-text-muted min-w-12">직무</div>
              <div className="flex gap-2 flex-wrap">
                {user.jobConditions.positions.map((pos, idx) => (
                  <span key={idx} className="inline-block px-3 py-1 bg-app-primary/10 text-app-primary text-xs rounded-full">
                    {pos} 
                  </span>
                ))}
              </div>
            </div>
 
            {/* 지역 - 가로 */}
            <div className="flex items-center gap-3">
              <div className="text-xs text-app-text-muted min-w-12">지역</div>
              <div className="flex gap-2 flex-wrap">
                {user.jobConditions.locations.map((loc, idx) => (
                  <span key={idx} className="inline-block px-3 py-1 bg-app-primary/10 text-app-primary text-xs rounded-full">
                    {loc} 
                  </span>
                ))}
              </div>
            </div>
 
            {/* 경력 - 드롭다운 */}
            <div className="flex items-center gap-3">
              <div className="text-xs text-app-text-muted min-w-12">경력</div>
              <select className="px-3 py-1.5 border border-app-border rounded text-xs">
                <option>{user.jobConditions.experiences[0]}</option>
                <option>신입</option>
                <option>1년 이상</option>
                <option>3년 이상</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 이력서 관리 */}
      <div className="border border-app-border rounded-lg p-6 bg-white">
        <div className="flex items-center gap-1.5 mb-6">
          <h2 className="font-semibold text-app-text">이력서 관리</h2>
          <img src="/edit-icon.png" alt="수정" className="w-5 h-5" />
        </div>

        <div className="space-y-3">
          {user.resumes.map((resume) => (
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                {resume.status === 'primary' ? (
                  <img src="/submit-icon.png" alt="활성" className="w-8 h-8" />
                ) : (
                  <img src="/submit-no-icon.png" alt="비활성" className="w-8 h-8" />
                )}
                <div>
                  <div className="text-sm font-medium text-app-text">{resume.name}</div>
                  <div className="text-xs text-app-text-muted">{resume.date}</div>
                </div>
              </div>
              
              {resume.status === 'primary' ? (
                <span className="text-xs font-semibold text-app-primary">활성</span>
              ) : (
                <span className="text-xs font-semibold text-app-text-muted">비활성</span>
              )}
            </div>
          ))}
        </div>

        <button className="flex items-center justify-center gap-2 w-full mt-4 py-2 border border-dashed border-app-border rounded text-sm text-app-text-muted hover:bg-app-bg transition-colors">
          <img src="/upload-icon.png" alt="업로드" className="w-3 h-3" />
          <span>PDF 업로드</span>
        </button>
      </div>
    </div>
  );
}