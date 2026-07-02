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

  // spec §7: 직무설정(step 1)에서는 팬 카드 선택 전까지 '다음으로' 비활성.
  // 다른 단계 진행 로직은 미변경. '건너뛰기'는 선택 없이도 통과 허용.
  const nextDisabled = step === 1 && state.jobRole === null;

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleFinish = () => submit.mutate(state);

  // 건너뛰기: 현재 단계 기본값 유지하고 다음으로, 마지막이면 제출.
  const handleSkip = () => (isLast ? handleFinish() : next());

  return (
    // §1 페이지 배경: Dev Mode 기준 width 1440 / padding 163 443 139 442 고정이지만
    // 기존 위저드가 반응형이므로 화면 채움 + 중앙 정렬 + 콘텐츠 폭(≈555px)으로 매핑.
    // (1440 고정 vs 반응형은 추후 디자이너 확인 — 명세 ⚠️5)
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(327deg,#DDDDFB_-0.86%,#FFF_56.45%)] px-4 py-16">
      {/* §1 between-cards 간격은 Dev Mode에 없음(명세 ⚠️1) → 16px로 잠정 적용 */}
      <div className="flex w-full max-w-[555px] flex-col gap-4">
        {/* §2 스텝 인디케이터 카드 */}
        <StepIndicator steps={STEPS} current={step} />

        {/* §8 폼 본문 카드 (제목 + 지역 + 채용형태 + 버튼) */}
        <div className="relative flex flex-col items-start gap-8 self-stretch rounded-2xl bg-white/50 p-10 shadow-[0_0_24px_0_rgba(51,68,255,0.12)]">
          {/* §4 우측 상단 건너뛰기 */}
          <button
            type="button"
            onClick={handleSkip}
            className="absolute right-10 top-10 font-pretendard text-sm text-[#AFB8C2] hover:text-[#303D4C]"
          >
            건너뛰기
          </button>

          {step === 0 && <Step1BasicInfo state={state} dispatch={dispatch} />}
          {step === 1 && <Step2JobRole state={state} dispatch={dispatch} />}
          {step === 2 && <Step3Resume state={state} dispatch={dispatch} />}
          {step === 3 && <Step4Notification state={state} dispatch={dispatch} />}

          {/* §7 하단 버튼: 이전으로 / 다음으로 */}
          <div className="flex items-center justify-between gap-2 self-stretch">
            <button
              type="button"
              onClick={prev}
              disabled={step === 0}
              className="h-11 w-[103px] rounded-lg bg-[#A1A9FF]/80 font-pretendard text-sm font-semibold text-gray-50 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              이전으로
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={handleFinish}
                disabled={submit.isPending}
                className="flex h-11 items-center justify-center gap-2.5 rounded-lg bg-[#4741FF] px-4 py-2 font-pretendard text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {submit.isPending ? '시작하는 중...' : '시작하기 →'}
              </button>
            ) : (
              <button
                type="button"
                onClick={next}
                disabled={nextDisabled}
                className="flex h-11 w-[103px] items-center justify-center gap-2.5 rounded-lg bg-[#4741FF] px-2.5 py-2 font-pretendard text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                다음으로 →
              </button>
            )}
          </div>

          {submit.isError && (
            <p className="self-stretch text-right text-xs text-red-500">
              제출에 실패했어요. 다시 시도해 주세요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
