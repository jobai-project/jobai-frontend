import { useState } from 'react';

interface NotificationState {
  email: boolean;
  slack: boolean;
  discord: boolean;
  minScore: number;
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationState>({
    email: true,
    slack: true,
    discord: false,
    minScore: 70,
  });

  const [isEditing, setIsEditing] = useState(false);
  // 취소 시 복원할 수 있도록 편집 진입 시점의 값을 스냅샷으로 저장
  const [snapshot, setSnapshot] = useState<NotificationState>(settings);

  const toggleChannel = (channel: 'email' | 'slack' | 'discord') => {
    setSettings((prev) => ({
      ...prev,
      [channel]: !prev[channel],
    }));
  };

  const handleEdit = () => {
    setSnapshot(settings);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setSettings(snapshot);
    setIsEditing(false);
  };

  const handleSave = () => {
    // TODO: 알림 채널 설정 저장 API 연결
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* 알림 채널 설정 */}
      <div className="w-[700px] flex flex-col justify-center border border-[#EBECFF]/90 rounded-2xl px-6 py-8 bg-white shadow-[0_4px_12px_rgba(124,119,255,0.08)]">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="font-semibold text-[16px] text-app-text">알림 채널 설정</h2>
          {!isEditing && (
            <button onClick={handleEdit} className="p-0 hover:opacity-80">
              <img src="/edit-icon.png" alt="수정" className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* 이메일 */}
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-6">
              <img src="/mail-icon.png" alt="등록" className="w-5 h-5" />
              <div>
                <div className="text-sm font-medium text-app-text mb-1">이메일</div>
                <div className="text-sm font-normal text-gray-400">juhoonkim22@gmail.com</div>
              </div>
            </div>
            <button
              onClick={() => toggleChannel('email')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.email ? 'bg-app-primary' : 'bg-app-border'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.email ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Slack */}
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-6">
              <img src="/slack-icon.png" alt="등록" className="w-5 h-5" />
              <div>
                <div className="text-sm font-medium text-app-text mb-1">Slack</div>
                {isEditing ? (
                  <button
                    onClick={() => {
                      // TODO: Slack 계정 재연결 플로우 연결
                    }}
                    className="text-sm font-normal text-app-primary hover:underline"
                  >
                    계정 재연결하기
                  </button>
                ) : (
                  <div className="text-sm font-normal text-gray-400">연결됨</div>
                )}
              </div>
            </div>
            <button
              onClick={() => toggleChannel('slack')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.slack ? 'bg-app-primary' : 'bg-app-border'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.slack ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Discord */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <img src="/discord-icon.png" alt="등록" className="w-5 h-5" />
              <div>
                <div className="text-sm font-medium text-app-text mb-1">Discord</div>
                {isEditing ? (
                  <button
                    onClick={() => {
                      // TODO: Discord 계정 재연결 플로우 연결
                    }}
                    className="text-sm font-normal text-app-primary hover:underline"
                  >
                    계정 재연결하기
                  </button>
                ) : (
                  <div className="text-sm font-normal text-gray-400">미 연결되었어요</div>
                )}
              </div>
            </div>
            <button
              onClick={() => toggleChannel('discord')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.discord ? 'bg-app-primary' : 'bg-app-border'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.discord ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 편집 모드일 때만 하단 구분선 + 취소/저장 */}
        {isEditing && (
          <>
            <div className="border-t border-gray-200 mt-5 mb-4" />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-semibold text-app-text-muted bg-app-bg border border-app-border rounded-lg hover:bg-app-hover transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-semibold text-white bg-app-primary rounded-lg hover:opacity-90 transition-opacity"
              >
                저장
              </button>
            </div>
          </>
        )}
      </div>

      {/* 알림 기준 점수 */}
      <div className="w-[700px] h-[102px] flex flex-col justify-center border border-[#EBECFF]/90 rounded-2xl p-6 bg-white shadow-[0_4px_12px_rgba(124,119,255,0.08)]">
        <h2 className="font-semibold text-[16px] text-app-text mb-5">알림 기준 점수</h2>

        <div className="flex items-center gap-4">
          <div className="text-sm font-normal text-gray-500 min-w-max">
            이 점수 이상 공고만 알림
          </div>

          <div className="flex items-center gap-4 flex-1">
            <input
              type="range"
              min="0"
              max="100"
              value={settings.minScore}
              onChange={(e) => setSettings((prev) => ({ ...prev, minScore: parseInt(e.target.value) }))}
              className="flex-1 h-1 rounded-lg appearance-none cursor-pointer accent-app-primary"
              style={{
                background: `linear-gradient(to right, #4741FF 0%, #4741FF ${(settings.minScore / 100) * 100}%, #D0D6DD ${(settings.minScore / 100) * 100}%, #D0D6DD 100%)`
              }}
            />
            <div className="text-[16px] font-semibold text-app-primary min-w-12">
              {settings.minScore}점
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}