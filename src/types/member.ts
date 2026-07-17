// 온보딩 제출 요청 타입 (E4·E5·E6). 값은 전부 한글 라벨(실측 확정).
// careerType: 서버가 string[]로 받음(복수 선택 가능). 예: ['신입'], ['신입','경력직']
// ❓ TODO(BE): careerType 정본 값 세트(2종 vs 4종) 확정 시 union으로 교체.
export interface OnboardingBasicInfoRequest {
  careerType: string[]; // 한글 라벨 배열. 예: ['신입']
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
  careerType: string[]; // 온보딩 전 빈 배열. 복수 선택 가능
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

// ── E3 요청 (PUT /api/v1/members/me/job-preferences) — 전체 교체, 세 필드 모두 필수 ──
export interface UpdateJobPreferencesRequest {
  careerType: string[];
  jobCategories: string[];
  locations: string[];
}

// ── E2 요청 (PATCH /api/v1/members/me/name) ──
// 서버가 공백만 있는 이름·20자 초과를 400으로 거부한다.
export interface UpdateNameRequest {
  name: string;
}

// GET /api/v1/members/me/notification-settings 응답
export interface NotificationSettingsResponse {
  emailEnabled: boolean;
  slackEnabled: boolean;
  discordEnabled: boolean;
  matchScoreThreshold: number;
  slackWebhookUrl: string | null;
  discordWebhookUrl: string | null;
}