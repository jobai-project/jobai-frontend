import type { RequirementGroup } from '@/types/requirement';

// TODO(백엔드 연동 필요): 공고 상세 응답 + 사용자 정보로 대체
export const mockRequirements: RequirementGroup[] = [
  {
    key: 'career',
    label: '경력',
    items: [
      {
        id: 'career-1',
        label: '프론트엔드 개발 경력 3~7년',
        status: 'unmet',
        description: '사용자님의 경력은 2년이에요', // 하드코딩
      },
    ],
  },
  {
    key: 'education',
    label: '학력',
    items: [
      { id: 'edu-1', label: '4년제 학사', status: 'met' },
      {
        id: 'edu-2',
        label: '26년 8월 졸업 예정자',
        status: 'na',
        description: '사용자님은 해당 사항이 아니에요',
      },
    ],
  },
  {
    key: 'skill',
    label: '스킬',
    items: [
      { id: 'skill-1', label: 'React', status: 'met' },
      { id: 'skill-2', label: 'TypeScript', status: 'met' },
      {
        id: 'skill-3',
        label: 'Redux Toolkit',
        status: 'unmet',
        description: '사용자님이 보유하지 않은 스킬이에요',
      },
      { id: 'skill-4', label: 'Zustand', status: 'met' },
    ],
  },
];
