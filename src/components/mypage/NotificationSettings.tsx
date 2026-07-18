import { useEffect, useState, useRef } from 'react';
import { useNotificationSettings, useUpdateNotificationSettings } from '@/hooks/useMember';

interface NotificationState {
  email: boolean;
  slack: boolean;
  discord: boolean;
  minScore: number;
  slackWebhookUrl: string | null;
  discordWebhookUrl: string | null;
}

interface NotificationSettingsProps {
  email: string;
}

// Slack/Discord 웹훅 URL 입력 모달 - 다른 확인 모달(DeleteConfirmModal 등)과 동일한 디자인 톤
function WebhookUrlModal({
  title,
  description,
  initialValue,
  onSubmit,
  onCancel,
}: {
  title: string;
  description: string;
  initialValue: string;
  onSubmit: (url: string) => void;
  onCancel: () => void;
}) {
  const [url, setUrl] = useState(initialValue);

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 w-[420px] shadow-xl flex flex-col items-center"
      >
        <h3 className="text-center text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-center text-sm text-gray-500 mb-5">{description}</p>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://hooks.slack.com/services/..."
          autoFocus
          className="w-[324px] px-3 py-2.5 mb-5 border border-app-border rounded-lg text-sm"
        />

        <button
          onClick={() => url.trim() && onSubmit(url.trim())}
          disabled={!url.trim()}
          className="w-[324px] h-[45px] py-3 mb-2 rounded-xl bg-app-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          보내기
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

const LOADING_SKELETON = (
  <div className="space-y-6">
    <div className="h-[220px] w-[700px] animate-pulse rounded-2xl bg-[#F2F4F6]" />
    <div className="h-[102px] w-[700px] animate-pulse rounded-2xl bg-[#F2F4F6]" />
  </div>
);

export default function NotificationSettings({ email }: NotificationSettingsProps) {
  const { data, isLoading, isError } = useNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();

  // 하드코딩된 초기값을 화면에 잠깐이라도 보여주지 않기 위해 null로 시작한다.
  // (탭을 벗어났다 돌아오면 이 컴포넌트가 완전히 새로 마운트되는데, 이때
  //  기본값 { email: true, ... } 같은 게 실제 서버 값이 오기 전에 잠깐 그려지면
  //  "토글이 잘못된 상태로 보였다가 바뀐다"는 현상으로 나타난다. null로 두고
  //  data가 도착하기 전까지는 로딩 스켈레톤만 보여줘서 이 깜빡임 자체를 없앤다.)
  const [settings, setSettings] = useState<NotificationState | null>(null);

  useEffect(() => {
    if (data) {
      setSettings({
        email: data.emailEnabled,
        slack: data.slackEnabled,
        discord: data.discordEnabled,
        minScore: data.matchScoreThreshold,
        slackWebhookUrl: data.slackWebhookUrl,
        discordWebhookUrl: data.discordWebhookUrl,
      });
    }
  }, [data]);

  const [isEditing, setIsEditing] = useState(false);
  const [snapshot, setSnapshot] = useState<NotificationState | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const [webhookModalChannel, setWebhookModalChannel] = useState<'slack' | 'discord' | null>(null);

  const sliderValueRef = useRef(70);

  if (isLoading || !settings) {
    return LOADING_SKELETON;
  }

  if (isError) {
    return (
      <div className="flex h-[220px] w-[700px] items-center justify-center rounded-2xl border border-[#EBECFF]/90 bg-white text-sm text-app-text-muted shadow-[0_4px_12px_rgba(124,119,255,0.08)]">
        알림 설정을 불러오지 못했어요.
      </div>
    );
  }

  const isSlackConnected = settings.slackWebhookUrl != null;
  const isDiscordConnected = settings.discordWebhookUrl != null;

  // 저장은 항상 현재 알고 있는 전체 상태를 같이 보낸다(부분 필드만 보내면 나머지가
  // 서버에서 null/false로 덮어써질 수 있는 전체교체형 API이므로).
  const buildPayload = (next: NotificationState) => ({
    emailEnabled: next.email,
    slackEnabled: next.slack,
    discordEnabled: next.discord,
    matchScoreThreshold: next.minScore,
    slackWebhookUrl: next.slackWebhookUrl,
    discordWebhookUrl: next.discordWebhookUrl,
  });

  const toggleChannel = (channel: 'email' | 'slack' | 'discord') => {
    setSettings((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [channel]: !prev[channel] };
      updateSettings.mutate(buildPayload(next), {
        onError: () => {
          // 저장 실패 시 로컬 상태를 원래대로 되돌리고 알려준다.
          setSettings((current) =>
            current ? { ...current, [channel]: !current[channel] } : current,
          );
          showToast('설정 저장에 실패했어요. 다시 시도해주세요.');
        },
      });
      return next;
    });
  };

  const handleSliderChange = (value: number) => {
    sliderValueRef.current = value;
    setSettings((prev) => (prev ? { ...prev, minScore: value } : prev));
  };

  const handleSliderRelease = () => {
    setSettings((prev) => {
      if (!prev) return prev;
      const next = { ...prev, minScore: sliderValueRef.current };
      updateSettings.mutate(buildPayload(next), {
        onError: () => showToast('점수 저장에 실패했어요. 다시 시도해주세요.'),
      });
      return next;
    });
  };

  const handleEdit = () => {
    setSnapshot(settings);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (snapshot) setSettings(snapshot);
    setIsEditing(false);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleWebhookSubmit = (url: string) => {
    const channel = webhookModalChannel;
    if (!channel) return;

    setSettings((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        [channel === 'slack' ? 'slackWebhookUrl' : 'discordWebhookUrl']: url,
      };
      updateSettings.mutate(buildPayload(next), {
        onError: () => showToast('연결 저장에 실패했어요. 다시 시도해주세요.'),
      });
      return next;
    });
    setWebhookModalChannel(null);
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

                {!isSlackConnected ? (
                  <button
                    onClick={() => setWebhookModalChannel('slack')}
                    className="text-sm font-normal text-app-primary hover:underline"
                  >
                    계정 연결하기
                  </button>
                ) : isEditing ? (
                  <button
                    onClick={() => setWebhookModalChannel('slack')}
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

                {!isDiscordConnected ? (
                  <button
                    onClick={() => setWebhookModalChannel('discord')}
                    className="text-sm font-normal text-app-primary hover:underline"
                  >
                    계정 연결하기
                  </button>
                ) : isEditing ? (
                  <button
                    onClick={() => setWebhookModalChannel('discord')}
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

      {webhookModalChannel && (
        <WebhookUrlModal
          title={webhookModalChannel === 'slack' ? 'Slack 계정 연결하기' : 'Discord 계정 연결하기'}
          description="Webhook URL을 입력하고 보내기를 누르면 연결돼요."
          initialValue={
            (webhookModalChannel === 'slack' ? settings.slackWebhookUrl : settings.discordWebhookUrl) ?? ''
          }
          onSubmit={handleWebhookSubmit}
          onCancel={() => setWebhookModalChannel(null)}
        />
      )}

      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
}