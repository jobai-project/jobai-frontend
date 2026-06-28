import { Dispatch } from 'react';
import { OnboardingState, EMPLOYMENT_OPTIONS, RegionCode } from '../types';
import { OnboardingAction } from '../onboardingReducer';
import RegionMultiSelect from '../components/RegionMultiSelect';

interface StepProps {
  state: OnboardingState;
  dispatch: Dispatch<OnboardingAction>;
}

export default function Step1BasicInfo({ state, dispatch }: StepProps) {
  return (
    // §8: 제목블록·지역섹션·채용형태섹션 사이 간격 32px
    <div className="flex flex-col items-start gap-8 self-stretch">
      {/* §4 메인 제목 — Title 1: Pretendard 28 / 600 / 140% / -0.56px */}
      <h2 className="font-pretendard text-[28px] font-semibold leading-[140%] tracking-[-0.56px] text-[#171F29]">
        맞춤 공고 추천을 위해
        <br />
        기본 정보를 입력해주세요.
      </h2>

      {/* §5 희망 근무 지역 */}
      <div className="flex flex-col items-start gap-2 self-stretch">
        <h3 className="font-pretendard text-[18px] font-medium leading-[150%] tracking-[-0.36px] text-[#303D4C]">
          희망 근무 지역을 알려주세요.
        </h3>
        <RegionMultiSelect
          selected={state.locations}
          onChange={(next: RegionCode[]) =>
            dispatch({ type: 'SET_FIELD', key: 'locations', value: next })
          }
        />
      </div>

      {/* §6 희망하는 채용 형태 (단일 선택 라디오) */}
      <div className="flex flex-col items-start gap-2 self-stretch">
        <h3 className="font-pretendard text-[18px] font-medium leading-[150%] tracking-[-0.36px] text-[#303D4C]">
          희망하는 채용 형태를 선택해주세요.
        </h3>
        <div className="flex flex-col items-start gap-2 self-stretch">
          {EMPLOYMENT_OPTIONS.map((opt) => {
            const checked = state.employmentType === opt.value;
            return (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-center gap-3 self-stretch rounded-lg border p-3 ${
                  checked
                    ? 'border-[#4741FF] bg-[#EBECFF]'
                    : 'border-[#AFB8C2]'
                }`}
              >
                <input
                  type="radio"
                  name="employmentType"
                  checked={checked}
                  onChange={() =>
                    dispatch({
                      type: 'SET_FIELD',
                      key: 'employmentType',
                      value: opt.value,
                    })
                  }
                  className="sr-only"
                />
                {/* Ratio.svg(선택 에셋)가 빈 파일이라 CSS로 파란 라디오 렌더 */}
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    checked ? 'border-[#4741FF]' : 'border-[#AFB8C2]'
                  }`}
                >
                  {checked && (
                    <span className="h-2.5 w-2.5 rounded-full bg-[#4741FF]" />
                  )}
                </span>
                <span className="font-pretendard text-[15px] text-[#303D4C]">
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
