import DOMPurify from 'dompurify';

// 상세 본문 렌더용. private description 은 엔티티 이스케이프된 HTML(&lt;p&gt;),
// public htmlContent 는 생 HTML → 둘 다 (1) 엔티티 디코드 후 (2) sanitize 한다.
// 외부 파싱 결과라 신뢰 불가 → dangerouslySetInnerHTML 전 반드시 이 함수를 거친다.
export function decodeAndSanitize(raw: string | null | undefined): string {
  if (!raw) return '';
  // textarea 는 RCDATA — 엔티티는 디코드하고 태그는 그대로 둔다(생 HTML엔 무해).
  const textarea = document.createElement('textarea');
  textarea.innerHTML = raw;
  const decoded = textarea.value;
  return DOMPurify.sanitize(decoded);
}
