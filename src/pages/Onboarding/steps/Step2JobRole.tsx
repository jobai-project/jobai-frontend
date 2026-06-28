import { Dispatch, KeyboardEvent, useState } from 'react';
import { OnboardingState } from '../types';
import { OnboardingAction } from '../onboardingReducer';

interface StepProps {
  state: OnboardingState;
  dispatch: Dispatch<OnboardingAction>;
}

// 와이어프레임 미확정 단계 (spec §2 주석). 직무 키워드 추천 + 자유 입력으로 구성.
const SUGGESTED_JOB_TYPES = [
  '프론트엔드 개발',
  '백엔드 개발',
  '풀스택 개발',
  'DevOps',
  '데이터 엔지니어',
  'AI/ML 엔지니어',
  '모바일 개발',
];

export default function Step2JobRole({ state, dispatch }: StepProps) {
  const [input, setInput] = useState('');

  const setJobTypes = (next: string[]) =>
    dispatch({ type: 'SET_FIELD', key: 'jobTypes', value: next });

  const addJobType = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !state.jobTypes.includes(trimmed)) {
      setJobTypes([...state.jobTypes, trimmed]);
    }
    setInput('');
  };

  const removeJobType = (value: string) => {
    setJobTypes(state.jobTypes.filter((j) => j !== value));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addJobType(input);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-app-text mb-1">관심 직무</h3>
        <p className="text-xs text-app-text-muted mb-4">
          직무 키워드를 입력하거나 추천에서 선택하세요. (Enter로 추가)
        </p>

        {/* 선택된 직무 칩 */}
        {state.jobTypes.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {state.jobTypes.map((job) => (
              <span
                key={job}
                className="inline-flex items-center gap-2 px-3 py-1 bg-app-primary text-white text-xs rounded-full"
              >
                {job}
                <button
                  type="button"
                  onClick={() => removeJobType(job)}
                  className="hover:opacity-80"
                  aria-label={`${job} 제거`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* 자유 입력 */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="예: 프론트엔드 개발"
          className="w-full px-4 py-2 border border-app-border rounded-lg text-sm text-app-text focus:outline-none focus:ring-1 focus:ring-app-primary"
        />
      </div>

      {/* 추천 직무 */}
      <div>
        <div className="text-xs text-app-text-muted mb-3">추천 직무</div>
        <div className="flex gap-2 flex-wrap">
          {SUGGESTED_JOB_TYPES.filter((j) => !state.jobTypes.includes(j)).map(
            (job) => (
              <button
                key={job}
                type="button"
                onClick={() => addJobType(job)}
                className="px-3 py-1 border border-app-border rounded text-xs text-app-text hover:bg-app-bg"
              >
                + {job}
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
