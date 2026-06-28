// 경력 (Figma 라디오: 신입 / 1-3년 / 3-5년 / 5년 이상 → 단일 선택)
export type ExperienceLevel = 'NEW' | 'EXP_1_3' | 'EXP_3_5' | 'EXP_5_PLUS';

export const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: 'NEW', label: '신입' },
  { value: 'EXP_1_3', label: '1-3년' },
  { value: 'EXP_3_5', label: '3-5년' },
  { value: 'EXP_5_PLUS', label: '5년 이상' },
];

// 지역 (Figma 체크박스 목록 + "전체")
export const REGION_OPTIONS = [
  '서울', '부산', '경기', '대구', '판교', '전라', '인천',
  '경상', '대전', '강원', '충남', '제주', '세종', '해외',
] as const;
export type RegionCode = (typeof REGION_OPTIONS)[number];

// 이력서 업로드 상태
export type ResumeStatus = 'IDLE' | 'UPLOADING' | 'PENDING' | 'DONE' | 'FAIL';

// 온보딩 전체 폼 상태 (한 곳에서 관리)
export interface OnboardingState {
  // step1
  locations: RegionCode[];
  experience: ExperienceLevel;
  // step2
  jobTypes: string[];
  // step3
  resumeId: string | null;
  resumeFileName: string | null;
  resumeStatus: ResumeStatus;
  // step4
  notifyEmail: boolean;
  slackWebhook: string | null;
  discordWebhook: string | null;
  scoreThreshold: number; // 0~100, 기본 70
}

export const INITIAL_ONBOARDING: OnboardingState = {
  locations: [],
  experience: 'NEW',
  jobTypes: [],
  resumeId: null,
  resumeFileName: null,
  resumeStatus: 'IDLE',
  notifyEmail: true,
  slackWebhook: null,
  discordWebhook: null,
  scoreThreshold: 70,
};
