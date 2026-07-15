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

// ── E1 응답 (GET /api/v1/members/me) ──
export interface MemberProfile {
  name: string;
  email: string;
  profileImageUrl: string | null; // 실측 null 가능
}

export interface JobPreference {
  careerType: string | null; // 온보딩 전 null 실측
  jobCategories: string[]; // 한글. 예: ["개발자"]
  locations: string[]; // 한글 시도명. 예: ["서울"]
}

// 정의만. 소비하지 않음 — 이력서는 useResumes()(/members/resumes)가 정본.
export interface MemberMeResume {
  resumeId: number;
  originalFilename: string;
  storedFileUrl: string;
  updatedAt: string;
  active: boolean; // 🔴 실측 필드명 (types/resume.ts 의 isActive 아님)
}

export interface MemberMeResponse {
  profile: MemberProfile;
  jobPreference: JobPreference;
  resumes: MemberMeResume[]; // 미사용
}

// ── E3 요청 (PUT /api/v1/members/me/job-preferences) — 🔴 전체 교체, 세 필드 모두 필수 ──
export interface UpdateJobPreferencesRequest {
  careerType: string;
  jobCategories: string[];
  locations: string[];
}

// ── E2 요청 (PATCH /api/v1/members/me/name) ──
// 서버가 공백만 있는 이름·20자 초과를 400으로 거부한다.
export interface UpdateNameRequest {
  name: string;
}