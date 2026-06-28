/** 요건 충족 상태 */
export type RequirementStatus = 'met' | 'unmet' | 'na';
// met: 충족(✓) / unmet: 미충족(!) / na: 해당없음(−, 학력 전용)

/** 요건 그룹 종류 */
export type RequirementGroupKey = 'career' | 'education' | 'skill';

/** 요건 1행 */
export interface RequirementItem {
  id: string;
  /** 행 제목 (예: "프론트엔드 개발 경력 3~7년") */
  label: string;
  status: RequirementStatus;
  /**
   * 보조 문구. 충족(met) 행은 보통 없음(undefined).
   * 현재는 mock에 하드코딩. TODO(백엔드 연동 필요): 사용자 데이터 기반 생성으로 교체.
   */
  description?: string;
}

/** 요건 그룹 */
export interface RequirementGroup {
  key: RequirementGroupKey;
  /** 그룹 라벨 (경력/학력/스킬) */
  label: string;
  items: RequirementItem[];
}
