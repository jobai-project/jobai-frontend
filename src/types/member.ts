// 온보딩 제출 요청 타입 (E4·E5·E6). 값은 전부 한글 라벨(실측 확정).
// careerType: 실측 '신입' 저장 확인. BE 검증이 없어 허용값 세트는 미확정.
// ❓ TODO(BE): careerType 정본 값 세트(2종 vs 4종) 확정 시 union으로 교체.
export interface OnboardingBasicInfoRequest {
  careerType: string; // 한글 라벨. 예: '신입'
  locations: string[]; // 한글 시도명. 예: ['서울']
}

export interface OnboardingJobCategoryRequest {
  jobCategories: string[]; // 한글 라벨. 예: ['개발자']
}

export interface OnboardingNotificationSettingsRequest {
  emailEnabled: boolean;
  slackEnabled: boolean; // 항상 false (UI 미배선)
  discordEnabled: boolean; // 항상 false (UI 미배선)
  matchScoreThreshold: number; // 0~100
}
