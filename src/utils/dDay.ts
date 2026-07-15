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

// 표시용: dDay(숫자|null) → 마감 텍스트. JobCard:99·DeadlineCard:82와 통일(dDay===0 → "D-0", D3).
export const formatDDay = (dDay: number | null): string => {
  if (dDay === null) return '상시';
  // TODO(G6): 백엔드 dDay 계산 버그(355551) 방어. 백엔드 수정 후 제거.
  if (dDay > 365) return '상시';
  if (dDay < 0) return '마감';
  return `D-${dDay}`; // dDay===0 → "D-0"
};
