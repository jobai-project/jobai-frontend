import { Dispatch } from 'react';
import { OnboardingState, EXPERIENCE_OPTIONS, RegionCode } from '../types';
import { OnboardingAction } from '../onboardingReducer';
import RegionMultiSelect from '../components/RegionMultiSelect';

interface StepProps {
  state: OnboardingState;
  dispatch: Dispatch<OnboardingAction>;
}

export default function Step1BasicInfo({ state, dispatch }: StepProps) {
  return (
    <div className="space-y-8">
      {/* 희망 근무 지역 */}
      <div>
        <h3 className="font-semibold text-app-text mb-1">희망 근무 지역</h3>
        <p className="text-xs text-app-text-muted mb-4">복수 선택할 수 있어요.</p>
        <RegionMultiSelect
          selected={state.locations}
          onChange={(next: RegionCode[]) =>
            dispatch({ type: 'SET_FIELD', key: 'locations', value: next })
          }
        />
      </div>

      {/* 현재 경력 */}
      <div>
        <h3 className="font-semibold text-app-text mb-4">현재 경력</h3>
        <div className="space-y-2">
          {EXPERIENCE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-3 px-4 py-3 border border-app-border rounded-lg cursor-pointer hover:bg-app-bg"
            >
              <input
                type="radio"
                name="experience"
                checked={state.experience === opt.value}
                onChange={() =>
                  dispatch({
                    type: 'SET_FIELD',
                    key: 'experience',
                    value: opt.value,
                  })
                }
                className="accent-app-primary"
              />
              <span className="text-sm text-app-text">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
