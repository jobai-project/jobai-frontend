import { useReducer, useState } from 'react';
import { onboardingReducer } from './onboardingReducer';
import { INITIAL_ONBOARDING } from './types';
import { useSubmitOnboarding } from '@/hooks/useSubmitOnboarding';
import StepIndicator from './components/StepIndicator';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2JobRole from './steps/Step2JobRole';
import Step3Resume from './steps/Step3Resume';
import Step4Notification from './steps/Step4Notification';

const STEPS = ['기본정보', '직무설정', '이력서', '알림설정'] as const;

export default function OnboardingPage() {
  const [step, setStep] = useState(0); // 0~3
  const [state, dispatch] = useReducer(onboardingReducer, INITIAL_ONBOARDING);
  const submit = useSubmitOnboarding();

  const isLast = step === STEPS.length - 1;

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleFinish = () => submit.mutate(state);

  // 건너뛰기: 현재 단계 기본값 유지하고 다음으로, 마지막이면 제출.
  const handleSkip = () => (isLast ? handleFinish() : next());

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-app-border rounded-2xl p-8 shadow-sm">
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-app-text-muted hover:text-app-text"
          >
            건너뛰기
          </button>
        </div>

        <StepIndicator steps={STEPS} current={step} />

        <div className="min-h-[320px]">
          {step === 0 && <Step1BasicInfo state={state} dispatch={dispatch} />}
          {step === 1 && <Step2JobRole state={state} dispatch={dispatch} />}
          {step === 2 && <Step3Resume state={state} dispatch={dispatch} />}
          {step === 3 && <Step4Notification state={state} dispatch={dispatch} />}
        </div>

        <div className="flex items-center justify-between mt-8">
          <button
            type="button"
            onClick={prev}
            disabled={step === 0}
            className="px-4 py-2 text-sm font-semibold text-app-text-muted hover:text-app-text disabled:opacity-40 disabled:cursor-not-allowed"
          >
            이전으로
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={handleFinish}
              disabled={submit.isPending}
              className="px-6 py-2 text-sm font-semibold bg-app-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {submit.isPending ? '완료 중...' : '완료'}
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              className="px-6 py-2 text-sm font-semibold bg-app-primary text-white rounded-lg hover:opacity-90"
            >
              다음으로 →
            </button>
          )}
        </div>

        {submit.isError && (
          <p className="text-xs text-red-500 mt-3 text-right">
            제출에 실패했어요. 다시 시도해 주세요.
          </p>
        )}
      </div>
    </div>
  );
}
