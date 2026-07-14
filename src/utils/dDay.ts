// 마감일(deadline) → D-day 일수 계산. 검색 API 는 dDay 대신 날짜만 주므로 프론트 계산.
// null(상시모집) → null. 카드는 dDay===null 이면 "상시"로 렌더(JobCard.tsx:99).
// 시분초·타임존 영향을 없애려 날짜(YYYY-MM-DD)만 UTC 자정 기준으로 비교한다.
export function deadlineToDday(deadline: string | null): number | null {
  if (!deadline) return null;

  const [y, m, d] = deadline.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null; // 파싱 실패 시 상시 취급(카드 안 깨짐)

  const endDay = Date.UTC(y, m - 1, d);
  const now = new Date();
  const todayDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  return Math.round((endDay - todayDay) / 86_400_000);
}
