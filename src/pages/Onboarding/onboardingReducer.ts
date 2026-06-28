import { OnboardingState, INITIAL_ONBOARDING } from './types';

export type OnboardingAction =
  | {
      type: 'SET_FIELD';
      key: keyof OnboardingState;
      value: OnboardingState[keyof OnboardingState];
    }
  | { type: 'RESET' };

export function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction,
): OnboardingState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.key]: action.value };
    case 'RESET':
      return INITIAL_ONBOARDING;
    default:
      return state;
  }
}
