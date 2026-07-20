import { Dispatch, useState } from 'react';
import { OnboardingState } from '../types';
import { OnboardingAction } from '../onboardingReducer';
import { useAuthStore } from '@/stores/authStore';

interface StepProps {
  state: OnboardingState;
  dispatch: Dispatch<OnboardingAction>;
}

// 알림 채널 (spec §3). 아이콘은 public/ 절대경로. Slack/Discord는 마이페이지와 동일하게
// webhookUrl null 여부를 on/off 소스로 사용(더 이상 미연결 고정 아님, D9 해소).
const CHANNELS = [
  { key: 'email', label: '이메일', icon: '/mail-icon.png' },
  { key: 'slack', label: 'Slack', icon: '/slack-icon.png' },
  { key: 'discord', label: 'Discord', icon: '/discord-icon.png' },
] as const;

function Toggle({ on, onToggle, disabled, label }: { on: boolean; onToggle: () => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`${label} 알림`}
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-[26px] w-[48px] shrink-0 items-center rounded-full transition-colors ${
        on ? 'bg-app-primary' : 'bg-app-border'
      } ${disabled ? 'cursor-not-allowed' : ''}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          on ? 'translate-x-[25px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
  );
}

// Slack/Discord 웹훅 URL 입력 모달 - 마이페이지와 동일한 디자인 톤
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

export default function Step4Notification({ state, dispatch }: StepProps) {
  const setField = (
    key: keyof OnboardingState,
    value: OnboardingState[keyof OnboardingState],
  ) => dispatch({ type: 'SET_FIELD', key, value });

  // 이메일 연결 표시(S4-A4, D8): 로그인 사용자 이메일. 출처=authStore.user.email(/api/v1/auth/me).
  const userEmail = useAuthStore((s) => s.user?.email);

  const [webhookModalChannel, setWebhookModalChannel] = useState<'slack' | 'discord' | null>(null);

  const toggleEmail = () => setField('notifyEmail', !state.notifyEmail);
  const toggleSlack = () => setField('notifySlack', !state.notifySlack);
  const toggleDiscord = () => setField('notifyDiscord', !state.notifyDiscord);

  const isSlackConnected = state.slackWebhookUrl != null;
  const isDiscordConnected = state.discordWebhookUrl != null;

  const handleWebhookSubmit = (url: string) => {
    if (webhookModalChannel === 'slack') {
      setField('slackWebhookUrl', url);
    } else if (webhookModalChannel === 'discord') {
      setField('discordWebhookUrl', url);
    }
    setWebhookModalChannel(null);
  };

  return (
    <div className="flex flex-col items-start gap-10 self-stretch">
      {/* 헤더 — Title 1 (Step 2/3와 동일하다고 가정, spec §5 ⚠️): 28/600/140%/-0.56px/gray-900 */}
      <h2 className="font-pretendard text-[28px] font-semibold leading-[140%] tracking-[-0.56px] text-[#171F29]">
        관심 있는 공고를 놓치지 않도록
        <br />
        알림을 설정해보세요.
      </h2>

      {/* 채널 섹션 — 제목↔행 gap-3(12px) (S4-A7) */}
      <div className="flex flex-col items-start gap-3 self-stretch">
        {/* 안내 문구 1 — 20px Medium #303D4C tracking-[-0.4px] (S4-A1) */}
        <p className="font-pretendard text-[20px] font-medium leading-[150%] tracking-[-0.4px] text-[#303D4C]">
          원하는 채널로 맞춤 공고 알림을 받아보세요.
        </p>

        {/* 채널 행 목록 — 행 간격 gap-5(20px) (S4-A7) */}
        <div className="flex w-full flex-col gap-5">
          {CHANNELS.map((ch) => {
            const isEmail = ch.key === 'email';
            const isSlack = ch.key === 'slack';

            const on = isEmail ? state.notifyEmail : isSlack ? state.notifySlack : state.notifyDiscord;
            const connected = isSlack ? isSlackConnected : isDiscordConnected;
            const onToggle = isEmail ? toggleEmail : isSlack ? toggleSlack : toggleDiscord;

            return (
              <div key={ch.key} className="flex items-center justify-between gap-4 self-stretch">
                {/* 아이콘 ↔ 채널명 gap-4(16px) (S4-A2) */}
                <div className="flex items-center gap-4">
                  {/* S4-A2(D5): 회색 칩 컨테이너 + 기존 아이콘(24px) 유지 */}
                  <span className="rounded-[21px] bg-[#F9FAFB] p-[10px] shadow-[0_0_7.6px_rgba(158,158,158,0.2)]">
                    <img src={ch.icon} alt="" aria-hidden className="h-6 w-6 object-contain" />
                  </span>
                  <div className="flex flex-col">
                    <span
                      className={`font-pretendard text-sm font-medium leading-[150%] tracking-[-0.28px] ${
                        on ? 'text-[#303D4C]' : 'text-gray-400'
                      }`}
                    >
                      {ch.label}
                    </span>
                    {isEmail ? (
                      // S4-A4: 이메일 연결됨 — 로그인 사용자 이메일 표시(14px #AFB8C2)
                      <span className="font-pretendard text-sm font-normal text-[#AFB8C2]">
                        {userEmail}
                      </span>
                    ) : connected ? (
                      // 마이페이지와 동일: 연결되면 "연결됨" 텍스트만 표시(클릭 불가)
                      <span className="font-pretendard text-sm font-normal text-[#AFB8C2]">
                        연결됨
                      </span>
                    ) : (
                      // S4-A3: 미연결 시 "계정 연결하기" 14px #4741FF, 클릭 시 웹훅 URL 입력 모달
                      <button
                        type="button"
                        onClick={() => setWebhookModalChannel(ch.key as 'slack' | 'discord')}
                        className="text-left font-pretendard text-sm font-normal text-[#4741FF] hover:opacity-80"
                      >
                        계정 연결하기
                      </button>
                    )}
                  </div>
                </div>
                {/* 마이페이지와 동일: Slack/Discord는 연결됐을 때만 토글 가능 */}
                <Toggle
                  on={on}
                  onToggle={onToggle}
                  disabled={!isEmail && !connected}
                  label={ch.label}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 적합도 기준 섹션 — 제목↔행 gap-3(12px) (S4-A7) */}
      <div className="flex flex-col items-start gap-3 self-stretch">
        {/* 안내 문구 2 — 20px Medium #303D4C tracking-[-0.4px] (S4-A1) */}
        <p className="font-pretendard text-[20px] font-medium leading-[150%] tracking-[-0.4px] text-[#303D4C]">
          원하는 적합도 기준을 설정해 공고 알림을 받아보세요.
        </p>

        {/* 적합도 슬라이더 (0~100, 기본 70). ⚠️ 트랙/핸들 규격·색상 미측정(spec §8.3) → 기존 규격 재사용 */}
        <div className="flex items-center gap-4 self-stretch">
          <input
            type="range"
            min="0"
            max="100"
            value={state.scoreThreshold}
            onChange={(e) => setField('scoreThreshold', parseInt(e.target.value, 10))}
            aria-label="적합도 기준 점수"
            className="h-1 flex-1 cursor-pointer appearance-none rounded-lg accent-app-primary"
            style={{
              background: `linear-gradient(to right, #4741FF 0%, #4741FF ${state.scoreThreshold}%, #D0D6DD ${state.scoreThreshold}%, #D0D6DD 100%)`,
            }}
          />
          <div className="min-w-12 text-right font-pretendard text-base font-semibold text-app-primary">
            {state.scoreThreshold}점
          </div>
        </div>
      </div>

      {/* 웹훅 URL 입력 모달 */}
      {webhookModalChannel && (
        <WebhookUrlModal
          title={webhookModalChannel === 'slack' ? 'Slack 계정 연결하기' : 'Discord 계정 연결하기'}
          description="Webhook URL을 입력하고 보내기를 누르면 연결돼요."
          initialValue={
            (webhookModalChannel === 'slack' ? state.slackWebhookUrl : state.discordWebhookUrl) ?? ''
          }
          onSubmit={handleWebhookSubmit}
          onCancel={() => setWebhookModalChannel(null)}
        />
      )}
    </div>
  );
}