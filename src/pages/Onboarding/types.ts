// 경력 (Figma 라디오: 신입 / 1-3년 / 3-5년 / 5년 이상 → 단일 선택)
// Step1 UI 미노출·서버 제출(E4~E6) 미전송이고, conditionStore 제거 후 소비처가 없는 죽은 값.
// 필드 제거는 별도 작업 — 지금은 데이터 모델/기본값만 유지한다.
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
// 지역 목록 (Figma 확정: 17개 시도). locations 저장·FilterBar 필터에 쓰는 실제 지역.
// 배열 순서 = 드롭다운 column-major 표시 순(좌열 서울~제주 8개, 우열 부산~광주 9개).
export const REGION_OPTIONS = [
  '서울', '경기', '인천', '대전', '충남', '충북', '세종', '제주',
  '부산', '대구', '울산', '경북', '경남', '강원', '전북', '전남', '광주',
] as const;
export type RegionCode = (typeof REGION_OPTIONS)[number];

// 드롭다운 표시용: '전체'(좌열 첫 칸) + 17개 지역. '전체'는 select-all 트리거일 뿐
// 실제 저장/타입(RegionCode)에는 포함하지 않는다(FilterBar·locations 오염 방지).
export const REGION_SELECT_OPTIONS = ['전체', ...REGION_OPTIONS] as const;

// step2 희망 직무 (온보딩 합본 카드 — spec v2). 사용자 노출 문자열은 한국어,
// 코드 식별자는 영어. 상태별 합본 이미지 4장(초기 + 선택 3장)은 Step2JobRole에서
// 한글 파일명 인코딩 이슈를 피해 import로 참조한다(spec v2 §2).
export type Role = 'developer' | 'designer' | 'planner';

// 표시 순서(왼쪽→오른쪽)와 사용자 노출 라벨. 3등분 클릭 버튼 순서도 이 배열을 따른다.
export const ROLES: { key: Role; label: string }[] = [
  { key: 'developer', label: '개발자' },
  { key: 'designer', label: '디자이너' },
  { key: 'planner', label: '기획자' },
];

// 이력서 업로드 상태
export type ResumeStatus = 'IDLE' | 'UPLOADING' | 'PENDING' | 'DONE' | 'FAIL';

// 온보딩 전체 폼 상태 (한 곳에서 관리)
export interface OnboardingState {
  // step1
  locations: RegionCode[];
  experience: ExperienceLevel;
  // 채용 형태 다중 선택(Figma: 인턴+신입 동시 선택 가능).
  // TODO(백엔드 연동 필요): employmentType 제출 페이로드 매핑 —
  // BE 협의 전까지 프론트 상태로만 보관(useSubmitOnboarding 미연동).
  employmentType: EmploymentType[];
  // step2 — 팬 카드에서 선택한 단일 희망 직무 (미선택 시 null).
  jobRole: Role | null;
  // TODO(백엔드 연동 필요): jobRole → 제출 payload/conditions.keywords 매핑.
  // BE 협의 전까지 jobTypes는 기존 파이프라인 호환용으로 유지(현재 미입력 → []).
  jobTypes: string[];
  // step3 — resumeId 는 백엔드 Long → number (업로드 응답값)
  resumeId: number | null;
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
  employmentType: [],
  jobRole: null,
  jobTypes: [],
  resumeId: null,
  resumeFileName: null,
  resumeStatus: 'IDLE',
  notifyEmail: true,
  slackWebhook: null,
  discordWebhook: null,
  scoreThreshold: 70,
};
