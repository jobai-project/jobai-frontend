import type { RequirementStatus } from '@/types/requirement';

const ICON: Record<RequirementStatus, string> = {
  met: '/Component11-2.svg', // 초록 ✓
  unmet: '/Component11-3.svg', // 빨강 !
  na: '/Component11.svg', // 회색 −
};

const ALT: Record<RequirementStatus, string> = {
  met: '충족',
  unmet: '미충족',
  na: '해당 없음',
};

export const getRequirementIcon = (s: RequirementStatus) => ICON[s];
export const getRequirementAlt = (s: RequirementStatus) => ALT[s];
