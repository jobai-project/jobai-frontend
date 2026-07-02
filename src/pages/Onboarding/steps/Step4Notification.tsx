import { Dispatch } from 'react';
import { OnboardingState } from '../types';
import { OnboardingAction } from '../onboardingReducer';

interface StepProps {
  state: OnboardingState;
  dispatch: Dispatch<OnboardingAction>;
}

// 알림 채널 (spec §3). 아이콘은 public/ 절대경로. Slack/Discord는 기존 상태모델
// (slackWebhook/discordWebhook null 여부)을 on/off 소스로 재사용해 제출 파이프라인 유지.
const CHANNELS = [
  { key: 'email', label: '이메일', icon: '/mail-icon.png' },
  { key: 'slack', label: 'Slack', icon: '/slack-icon.png' },
  { key: 'discord', label: 'Discord', icon: '/discord-icon.png' },
] as const;

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  // ⚠️ 토글 크기/색상(ON/OFF) 미측정(spec §8.2) → 기존 컴포넌트 규격 재사용.
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`${label} 알림`}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        on ? 'bg-app-primary' : 'bg-app-border'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          on ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function Step4Notification({ state, dispatch }: StepProps) {
  const setField = (
    key: keyof OnboardingState,
    value: OnboardingState[keyof OnboardingState],
  ) => dispatch({ type: 'SET_FIELD', key, value });

  const isOn = (key: (typeof CHANNELS)[number]['key']): boolean => {
    if (key === 'email') return state.notifyEmail;
    if (key === 'slack') return state.slackWebhook !== null;
    return state.discordWebhook !== null;
  };

  const toggle = (key: (typeof CHANNELS)[number]['key']) => {
    if (key === 'email') return setField('notifyEmail', !state.notifyEmail);
    // TODO(백엔드 연동 필요): 실제 계정 연결(OAuth/Webhook)로 교체. 지금은 on/off만.
    if (key === 'slack')
      return setField('slackWebhook', state.slackWebhook !== null ? null : '');
    return setField('discordWebhook', state.discordWebhook !== null ? null : '');
  };

  return (
    <div className="flex flex-col items-start gap-8 self-stretch">
      {/* 헤더 — Title 1 (Step 2/3와 동일하다고 가정, spec §5 ⚠️): 28/600/140%/-0.56px/gray-900 */}
      <h2 className="font-pretendard text-[28px] font-semibold leading-[140%] tracking-[-0.56px] text-[#171F29]">
        관심 있는 공고를 놓치지 않도록
        <br />
        알림을 설정해보세요.
      </h2>

      {/* 채널 섹션 */}
      <div className="flex flex-col items-start gap-4 self-stretch">
        {/* 안내 문구 1 — ⚠️ 개별 폰트 미측정(spec §8.5), 확정색 gray-800 #303D4C 적용 */}
        <p className="font-pretendard text-sm font-medium leading-[150%] tracking-[-0.28px] text-[#303D4C]">
          원하는 채널로 맞춤 공고 알림을 받아보세요.
        </p>

        {/* 채널 행: (좌) 아이콘+채널명+계정 연결하기 / (우) 토글.
            ⚠️ 실측 행 크기 475×30 / gap 4px 이 안내문구 줄인지 채널 행인지 미확정(spec §8.1) → TODO */}
        {CHANNELS.map((ch) => {
          const on = isOn(ch.key);
          return (
            <div key={ch.key} className="flex items-center justify-between gap-4 self-stretch">
              <div className="flex items-center gap-3">
                <img src={ch.icon} alt="" aria-hidden className="h-6 w-6 object-contain" />
                <div className="flex flex-col">
                  <span className="font-pretendard text-sm font-medium leading-[150%] tracking-[-0.28px] text-[#303D4C]">
                    {ch.label}
                  </span>
                  {/* ⚠️ 계정 연결 동작 미측정(spec §3) — mock 버튼. TODO(백엔드 연동 필요) */}
                  <button
                    type="button"
                    className="text-left font-pretendard text-xs font-normal text-app-text-muted hover:text-app-text"
                  >
                    계정 연결하기
                  </button>
                </div>
              </div>
              <Toggle on={on} onToggle={() => toggle(ch.key)} label={ch.label} />
            </div>
          );
        })}
      </div>

      {/* 적합도 기준 섹션 */}
      <div className="flex flex-col items-start gap-4 self-stretch">
        {/* 안내 문구 2 */}
        <p className="font-pretendard text-sm font-medium leading-[150%] tracking-[-0.28px] text-[#303D4C]">
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
          <div className="min-w-12 text-right font-pretendard text-sm font-semibold text-app-primary">
            {state.scoreThreshold}점
          </div>
        </div>
      </div>
    </div>
  );
}
