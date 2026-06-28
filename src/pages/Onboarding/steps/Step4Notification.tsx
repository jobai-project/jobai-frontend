import { Dispatch } from 'react';
import { OnboardingState } from '../types';
import { OnboardingAction } from '../onboardingReducer';

interface StepProps {
  state: OnboardingState;
  dispatch: Dispatch<OnboardingAction>;
}

function Toggle({
  on,
  onToggle,
}: {
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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

  const slackOn = state.slackWebhook !== null;
  const discordOn = state.discordWebhook !== null;

  return (
    <div className="space-y-6">
      {/* 알림 채널 */}
      <div className="border border-app-border rounded-lg p-6 bg-white">
        <h3 className="font-semibold text-app-text mb-6">알림 채널 설정</h3>

        <div className="space-y-4">
          {/* 이메일 */}
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-app-text">이메일</div>
            <Toggle
              on={state.notifyEmail}
              onToggle={() => setField('notifyEmail', !state.notifyEmail)}
            />
          </div>

          {/* Slack */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-app-text">Slack</div>
              <Toggle
                on={slackOn}
                onToggle={() => setField('slackWebhook', slackOn ? null : '')}
              />
            </div>
            {slackOn && (
              <input
                type="url"
                value={state.slackWebhook ?? ''}
                onChange={(e) => setField('slackWebhook', e.target.value)}
                placeholder="Slack Webhook URL"
                className="w-full px-3 py-2 border border-app-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-app-primary"
              />
            )}
          </div>

          {/* Discord */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-app-text">Discord</div>
              <Toggle
                on={discordOn}
                onToggle={() =>
                  setField('discordWebhook', discordOn ? null : '')
                }
              />
            </div>
            {discordOn && (
              <input
                type="url"
                value={state.discordWebhook ?? ''}
                onChange={(e) => setField('discordWebhook', e.target.value)}
                placeholder="Discord Webhook URL"
                className="w-full px-3 py-2 border border-app-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-app-primary"
              />
            )}
          </div>
        </div>
      </div>

      {/* 알림 기준 점수 */}
      <div className="border border-app-border rounded-lg p-6 bg-white">
        <h3 className="font-semibold text-app-text mb-6">알림 기준 점수</h3>
        <div className="flex items-center gap-4">
          <div className="text-xs text-app-text-muted min-w-max">
            이 점수 이상 공고만 알림
          </div>
          <div className="flex items-center gap-4 flex-1">
            <input
              type="range"
              min="0"
              max="100"
              value={state.scoreThreshold}
              onChange={(e) =>
                setField('scoreThreshold', parseInt(e.target.value, 10))
              }
              className="flex-1 h-1 rounded-lg appearance-none cursor-pointer accent-app-primary"
              style={{
                background: `linear-gradient(to right, #4741FF 0%, #4741FF ${state.scoreThreshold}%, #D0D6DD ${state.scoreThreshold}%, #D0D6DD 100%)`,
              }}
            />
            <div className="text-sm font-semibold text-app-primary min-w-12">
              {state.scoreThreshold}점
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
