// 경력 (Figma 라디오: 신입 / 1-3년 / 3-5년 / 5년 이상 → 단일 선택)
// 제출 파이프라인(useSubmitOnboarding → createCondition/conditionStore → 홈 필터)이
// 이 값을 사용하므로 데이터 모델/기본값은 그대로 유지한다. (Step1 UI에서는 더 이상
// 노출하지 않지만 INITIAL_ONBOARDING 기본값으로 계속 제출된다.)
export type ExperienceLevel = 'NEW' | 'EXP_1_3' | 'EXP_3_5' | 'EXP_5_PLUS';

export const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: 'NEW', label: '신입' },
  { value: 'EXP_1_3', label: '1-3년' },
  { value: 'EXP_3_5', label: '3-5년' },
  { value: 'EXP_5_PLUS', label: '5년 이상' },
];

// 채용 형태 (Figma 1단계 §6 라디오: 인턴 / 신입 / 경력직 / 계약직 → 단일 선택)
export type EmploymentType = 'INTERN' | 'NEWCOMER' | 'EXPERIENCED' | 'CONTRACT';

export const EMPLOYMENT_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: 'INTERN', label: '인턴' },
  { value: 'NEWCOMER', label: '신입' },
  { value: 'EXPERIENCED', label: '경력직' },
  { value: 'CONTRACT', label: '계약직' },
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
  // TODO(백엔드 연동 필요): employmentType(채용형태) 제출 페이로드 매핑 —
  // BE 협의 전까지 프론트 상태로만 보관(useSubmitOnboarding 미연동).
  employmentType: EmploymentType;
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
  employmentType: 'NEWCOMER',
  jobTypes: [],
  resumeId: null,
  resumeFileName: null,
  resumeStatus: 'IDLE',
  notifyEmail: true,
  slackWebhook: null,
  discordWebhook: null,
  scoreThreshold: 70,
};
