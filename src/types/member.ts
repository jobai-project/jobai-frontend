// 온보딩 제출 요청 타입 (E4·E5·E6). 값은 전부 한글 라벨(실측 확정).

// ✅ Swagger 실측: E4·E3 공통. 서버가 4종만 허용하며 검증한다(위반 시 400).
export type CareerType = '인턴' | '신입' | '경력직' | '계약직';

export interface OnboardingBasicInfoRequest {
  // ✅ Swagger 실측: 1개 이상 4개 이하 배열. 원소는 CareerType 4종(서버 검증 있음).
  careerType: CareerType[]; // 예: ['신입'], ['신입','계약직']
  locations: string[]; // 한글 시도명. 필수. 전체 삭제 시 [] 명시 전송(누락하면 400)
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
  // ✅ E1 응답 배열 확정 (실서버 응답 실측: ["인턴"]). B1 해제.
  // ⚠️ union 미승격: 4종 검증은 요청 경로에만 있음. 과거 2종(신입/경력) 시절
  //    legacy 값이 DB에 남아있을 수 있어 응답을 CareerType[]로 좁히면 거짓이 될 수 있음.
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
  careerType: string[]; // TODO(union): 4종 확정됨. MyPage.tsx:93 edited.experiences 타입 정리 후 CareerType[] 승격
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