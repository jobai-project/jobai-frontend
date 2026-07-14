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
        <div className="flex flex-col items-start gap-[12px] self-stretch">
          {EMPLOYMENT_OPTIONS.map((opt) => {
            const checked = state.employmentType === opt.value;
            return (
              // A-1: 카드형(bg-white + 그림자) + 우측 체크. 단일선택(배타) 로직 유지.
              <label
                key={opt.value}
                className="flex h-[48px] cursor-pointer items-center justify-between self-stretch rounded-[12px] bg-white px-3 shadow-[0_0_7.6px_rgba(158,158,158,0.2)]"
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
                <span className="font-pretendard text-[14px] font-normal text-[#171F29]">
                  {opt.label}
                </span>
                {/* 선택 시에만 우측 체크 아이콘 20px */}
                {checked && (
                  <img src="/check.svg" alt="" aria-hidden className="h-5 w-5 shrink-0" />
                )}
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
