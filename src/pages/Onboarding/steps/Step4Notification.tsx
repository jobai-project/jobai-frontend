import { Dispatch } from 'react';
import { OnboardingState } from '../types';
import { OnboardingAction } from '../onboardingReducer';
import { useAuthStore } from '@/stores/authStore';

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
      className={`relative inline-flex h-[26px] w-[48px] shrink-0 items-center rounded-full transition-colors ${
        on ? 'bg-app-primary' : 'bg-app-border'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          on ? 'translate-x-[25px]' : 'translate-x-[3px]'
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

  // 이메일 연결 표시(S4-A4, D8): 로그인 사용자 이메일. 출처=authStore.user.email(/api/v1/auth/me).
  const userEmail = useAuthStore((s) => s.user?.email);

  // 이메일만 토글 가능. Slack/Discord는 미연결 고정(D9)이라 여기서 처리하지 않음.
  const toggleEmail = () => setField('notifyEmail', !state.notifyEmail);

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
            // Slack/Discord: 미연결 고정 OFF (D9). 이메일만 실제 토글 상태 반영.
            const on = isEmail ? state.notifyEmail : false;
            return (
              <div key={ch.key} className="flex items-center justify-between gap-4 self-stretch">
                {/* 아이콘 ↔ 채널명 gap-4(16px) (S4-A2) */}
                <div className="flex items-center gap-4">
                  {/* S4-A2(D5): 회색 칩 컨테이너 + 기존 아이콘(24px) 유지 */}
                  <span className="rounded-[21px] bg-[#F9FAFB] p-[10px] shadow-[0_0_7.6px_rgba(158,158,158,0.2)]">
                    <img src={ch.icon} alt="" aria-hidden className="h-6 w-6 object-contain" />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-pretendard text-sm font-medium leading-[150%] tracking-[-0.28px] text-[#303D4C]">
                      {ch.label}
                    </span>
                    {isEmail ? (
                      // S4-A4: 이메일 연결됨 — 로그인 사용자 이메일 표시(14px #AFB8C2)
                      <span className="font-pretendard text-sm font-normal text-[#AFB8C2]">
                        {userEmail}
                      </span>
                    ) : (
                      // S4-A3: Slack/Discord "계정 연결하기" 14px #4741FF. 미연결 고정(D9).
                      // TODO(webhook vs OAuth): 실제 연결 방식 결정 후 배선.
                      <button
                        type="button"
                        className="text-left font-pretendard text-sm font-normal text-[#4741FF] hover:opacity-80"
                      >
                        계정 연결하기
                      </button>
                    )}
                  </div>
                </div>
                {/* Slack/Discord 토글은 OFF 고정(비배선). 이메일만 토글 (D9) */}
                <Toggle on={on} onToggle={() => isEmail && toggleEmail()} label={ch.label} />
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
    </div>
  );
}
