// 사용자 구직 조건(온보딩에서 수집)을 다루는 단일 진입점.
// 지금은 localStorage 임시 저장. BE 연동 시 이 파일 내부 구현만
// GET/POST /conditions 로 바꾸면 호출부(스토어)는 그대로 유지된다.
const CONDITION_KEY = 'jobai.condition';

// 필터링·환영카드 등에서 쓰는 조건의 최소 형태. 온보딩 타입과 분리해 두어
// 향후 서버 스키마 변화에 호출부가 흔들리지 않게 한다.
export interface UserCondition {
  locations: string[];
  experience: string;
  jobTypes: string[];
  scoreThreshold: number;
}

export function loadCondition(): UserCondition | null {
  const raw = localStorage.getItem(CONDITION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserCondition;
  } catch {
    return null; // 깨진 값이면 없는 것으로 안전하게 수렴
  }
}

export function saveCondition(condition: UserCondition): void {
  localStorage.setItem(CONDITION_KEY, JSON.stringify(condition));
}

export function clearCondition(): void {
  localStorage.removeItem(CONDITION_KEY);
}
