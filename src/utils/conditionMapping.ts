import type { UserCondition } from '@/utils/conditionStorage';

// MyPage 조건 편집기가 쓰는 형태 (직무/지역/경력 모두 문자열 배열)
export interface EditableConditions {
  positions: string[];
  locations: string[];
  experiences: string[];
}

// 경력: 편집기 문구 ↔ 조건 enum 상호 변환
const ENUM_TO_LABEL: Record<string, string> = {
  NEW: '신입',
  EXP_1_3: '1년 이상',
  EXP_3_5: '3년 이상',
  EXP_5_PLUS: '5년 이상',
};
const LABEL_TO_ENUM: Record<string, string> = {
  신입: 'NEW',
  '1년 이상': 'EXP_1_3',
  '3년 이상': 'EXP_3_5',
  '5년 이상': 'EXP_5_PLUS',
};

/** conditionStore → 편집기 형태. (없으면 빈 조건 + 신입) */
export function conditionToEditable(c: UserCondition | null): EditableConditions {
  if (!c) return { positions: [], locations: [], experiences: ['신입'] };
  return {
    positions: c.jobTypes,
    locations: c.locations,
    experiences: [ENUM_TO_LABEL[c.experience] ?? '신입'],
  };
}

/**
 * 편집기 형태 → conditionStore.
 * 경력은 enum 단일이라 experiences[0]만 사용. scoreThreshold·jobRole은 편집기에
 * 없으므로 기존값을 그대로 보존한다(누락 시 홈 히어로 역할이 지워지는 것 방지).
 */
export function editableToCondition(
  e: EditableConditions,
  scoreThreshold: number,
  jobRole?: UserCondition['jobRole'],
): UserCondition {
  return {
    jobTypes: e.positions,
    locations: e.locations,
    experience: LABEL_TO_ENUM[e.experiences[0]] ?? 'NEW',
    scoreThreshold,
    jobRole,
  };
}
