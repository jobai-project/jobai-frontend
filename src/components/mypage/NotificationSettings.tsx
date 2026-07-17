import { useEffect, useState, useRef } from 'react';
import { useNotificationSettings, useUpdateNotificationSettings } from '@/hooks/useMember';

interface NotificationState {
  email: boolean;
  slack: boolean;
  discord: boolean;
  minScore: number;
}

interface NotificationSettingsProps {
  // 로그인 시 사용한 이메일 (마이페이지 "내 정보"의 profile.email과 동일 값)
  email: string;
}

export default function NotificationSettings({ email }: NotificationSettingsProps) {
  const { data, isLoading, isError } = useNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();

  // 서버에서 받아온 값으로 로컬 편집 상태를 채운다. 슬라이더 드래그 중에는
  // 이 로컬 상태만 바뀌고, 서버 재조회로 다시 덮어써지지 않도록 data 변경 시에만 동기화한다.
  const [settings, setSettings] = useState<NotificationState>({
    email: true,
    slack: false,
    discord: false,
    minScore: 70,
  });

  useEffect(() => {
    if (data) {
      setSettings({
        email: data.emailEnabled,
        slack: data.slackEnabled,
        discord: data.discordEnabled,
        minScore: data.matchScoreThreshold,
      });
    }
  }, [data]);

  const [isEditing, setIsEditing] = useState(false);
  const [snapshot, setSnapshot] = useState<NotificationState>(settings);

  // Slack/Discord는 webhook이 실제로 연결되어 있을 때만 토글 가능하다.
  // (연결 안 됐으면 "계정 연결하기" 버튼만 누를 수 있고, 스위치는 클릭이 안 먹힌다.)
  const isSlackConnected = data?.slackWebhookUrl != null;
  const isDiscordConnected = data?.discordWebhookUrl != null;

  // 슬라이더는 드래그하는 동안 매 픽셀마다 API를 부르지 않고, 손을 뗀
  // 시점(release)에만 최종 값을 저장한다. 드래그 중 값은 sliderValueRef로 추적.
  const sliderValueRef = useRef(settings.minScore);

  const persist = (next: NotificationState) => {
    updateSettings.mutate({
      emailEnabled: next.email,
      slackEnabled: next.slack,
      discordEnabled: next.discord,
      matchScoreThreshold: next.minScore,
    });
  };

  const toggleChannel = (channel: 'email' | 'slack' | 'discord') => {
    setSettings((prev) => {
      const next = { ...prev, [channel]: !prev[channel] };
      persist(next); // 토글은 클릭 즉시 저장
      return next;
    });
  };

  const handleSliderChange = (value: number) => {
    sliderValueRef.current = value;
    setSettings((prev) => ({ ...prev, minScore: value })); // 화면만 즉시 갱신, 저장은 아직 안 함
  };

  const handleSliderRelease = () => {
    // 손을 뗀 시점의 최종 값으로 한 번만 저장
    setSettings((prev) => {
      const next = { ...prev, minScore: sliderValueRef.current };
      persist(next);
      return next;
    });
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
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-[220px] w-[700px] animate-pulse rounded-2xl bg-[#F2F4F6]" />
        <div className="h-[102px] w-[700px] animate-pulse rounded-2xl bg-[#F2F4F6]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[220px] w-[700px] items-center justify-center rounded-2xl border border-[#EBECFF]/90 bg-white text-sm text-app-text-muted shadow-[0_4px_12px_rgba(124,119,255,0.08)]">
        알림 설정을 불러오지 못했어요.
      </div>
    );
  }

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
                <div
                  className={`text-sm font-medium mb-1 ${
                    settings.email ? 'text-app-text' : 'text-gray-400'
                  }`}
                >
                  이메일
                </div>
                <div
                  className={`text-sm font-normal ${
                    settings.email ? 'text-gray-400' : 'text-gray-300'
                  }`}
                >
                  {email}
                </div>
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
                <div
                  className={`text-sm font-medium mb-1 ${
                    settings.slack ? 'text-app-text' : 'text-gray-400'
                  }`}
                >
                  Slack
                </div>
                {/* 지금은 연결 여부(slackWebhookUrl) 구분 없이 항상 "계정 연결하기"로
                    표시한다. 나중에 webhook 연결 상태에 따라 "연결됨"과 분기할 예정. */}
                <button
                  onClick={() => {
                    // TODO: Slack 계정 연결 플로우 연결
                  }}
                  className="text-sm font-normal text-app-primary hover:underline"
                >
                  계정 연결하기
                </button>
              </div>
            </div>
            <button
              onClick={() => isSlackConnected && toggleChannel('slack')}
              disabled={!isSlackConnected}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.slack ? 'bg-app-primary' : 'bg-app-border'
              } ${!isSlackConnected ? 'cursor-not-allowed' : ''}`}
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
                <div
                  className={`text-sm font-medium mb-1 ${
                    settings.discord ? 'text-app-text' : 'text-gray-400'
                  }`}
                >
                  Discord
                </div>
                {/* 지금은 연결 여부(discordWebhookUrl) 구분 없이 항상 "계정 연결하기"로
                    표시한다. 나중에 webhook 연결 상태에 따라 "연결됨"과 분기할 예정. */}
                <button
                  onClick={() => {
                    // TODO: Discord 계정 연결 플로우 연결
                  }}
                  className="text-sm font-normal text-app-primary hover:underline"
                >
                  계정 연결하기
                </button>
              </div>
            </div>
            <button
              onClick={() => isDiscordConnected && toggleChannel('discord')}
              disabled={!isDiscordConnected}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.discord ? 'bg-app-primary' : 'bg-app-border'
              } ${!isDiscordConnected ? 'cursor-not-allowed' : ''}`}
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
              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
              onMouseUp={handleSliderRelease}
              onTouchEnd={handleSliderRelease}
              onKeyUp={handleSliderRelease}
              className="flex-1 h-1 rounded-lg appearance-none cursor-pointer accent-app-primary"
              style={{
                background: `linear-gradient(to right, #4741FF 0%, #4741FF ${(settings.minScore / 100) * 100}%, #D0D6DD ${(settings.minScore / 100) * 100}%, #D0D6DD 100%)`,
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