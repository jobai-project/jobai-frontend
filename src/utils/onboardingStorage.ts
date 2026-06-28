// 온보딩 완료 여부를 다루는 단일 진입점.
// localStorage 키 문자열은 오직 이 파일에서만 관리한다 (오타·규약 불일치 방지).
// 실제 auth 연동 시 이 파일 내부 구현만 서버 user.onboarded 참조로 바꾸면
// 호출부(isOnboarded/markOnboarded)는 그대로 유지된다.
const ONBOARDED_KEY = 'jobai.onboarded';

/** 온보딩 완료자인지 여부. null / "false" / 잘못된 값 → 모두 false 로 수렴. */
export function isOnboarded(): boolean {
  return localStorage.getItem(ONBOARDED_KEY) === 'true';
}

/** 온보딩 마지막 step 제출 성공 후 단 1곳에서만 호출한다. */
export function markOnboarded(): void {
  localStorage.setItem(ONBOARDED_KEY, 'true');
}

/** QA/디버깅용 초기화. (콘솔에서 강제 재노출할 때) */
export function resetOnboarded(): void {
  localStorage.removeItem(ONBOARDED_KEY);
}
