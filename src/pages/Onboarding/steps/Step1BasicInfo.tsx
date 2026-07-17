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

      {/* §6 희망하는 채용 형태 (checkbox 토글 다중선택. E4 계약이 1~4개 배열이므로 다중선택이 정합) */}
      <div className="flex flex-col items-start gap-2 self-stretch">
        <h3 className="font-pretendard text-[18px] font-medium leading-[150%] tracking-[-0.36px] text-[#303D4C]">
          희망하는 채용 형태를 선택해주세요.
        </h3>
        <div className="flex flex-col items-start gap-[12px] self-stretch">
          {EMPLOYMENT_OPTIONS.map((opt) => {
            const checked = state.employmentType.includes(opt.value);
            return (
              // 카드형 + 우측 체크마크. 선택 시 배경 blue/100 + 글자 blue/500 SemiBold (Figma).
              <label
                key={opt.value}
                className={`flex h-[48px] cursor-pointer items-center justify-between self-stretch rounded-[12px] px-3 shadow-[0_0_7.6px_rgba(158,158,158,0.2)] ${
                  checked ? 'bg-[#EBECFF]' : 'bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    dispatch({
                      type: 'SET_FIELD',
                      key: 'employmentType',
                      value: checked
                        ? state.employmentType.filter((v) => v !== opt.value)
                        : [...state.employmentType, opt.value],
                    })
                  }
                  className="sr-only"
                />
                <span
                  className={`font-pretendard text-[14px] tracking-[-0.28px] ${
                    checked
                      ? 'font-semibold text-[#4741FF]'
                      : 'font-normal text-[#171F29]'
                  }`}
                >
                  {opt.label}
                </span>
                {/* 우측 체크마크 20px: 선택=파란 체크(onboardcheck.svg) / 미선택=회색 체크(onboarduncheck.svg) */}
                <img
                  src={checked ? '/onboardcheck.svg' : '/onboarduncheck.svg'}
                  alt=""
                  aria-hidden
                  className="h-5 w-5 shrink-0"
                />
              </label>
            );
          })}
        </div>
        {/* ❓ TODO: 경력 구분(EXPERIENCE_OPTIONS, types.ts:7)은 정의만 있고 Step1 미렌더 —
            채용 형태와 별도 항목 필요 여부 확인. 임의 추가/수정 안 함. */}
      </div>
    </div>
  );
}
