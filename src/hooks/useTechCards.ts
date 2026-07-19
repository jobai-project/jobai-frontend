import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/axios';
import { normalizeTechCardsResult } from '@/api/normalizeJob';
import type { RawTechCardsResult, TechCard, TechCardsResult } from '@/types/jobApi';

// 홈 "IT 한눈에" 표시 행 (badge 자동 분배 결과, 명세 §2-1).
export interface TechGlanceRow {
  badge: string;
  title: string; // ← headline
  sub: string; // ← subtext
  url: string | null; // 테크 뉴스 줄만 originalUrl, 나머지는 null(링크 없음)
}

// badge 고정 순서: 채용 트렌드 → 신규 공고 → 테크 뉴스. 서버 응답 문자열 그대로 상수화.
export const TECH_BADGE_ORDER = ['채용 트렌드', '신규 공고', '테크 뉴스'] as const;

// cards 를 badge 로 매칭해 고정 순서 행으로 변환. 없는 badge 는 그 줄만 제외(§2-4).
// 로그인/게스트 두 카드가 공유하는 순수 변환 — 마크업은 각 페이지가 담당.
export function toTechGlanceRows(cards: TechCard[]): TechGlanceRow[] {
  return TECH_BADGE_ORDER.flatMap((badge) => {
    // 테크 뉴스는 전부(N장) 펼치고, 나머지 badge 는 최대 1장.
    const matched = cards.filter((c) => c.badge === badge);
    const picked = badge === '테크 뉴스' ? matched : matched.slice(0, 1);
    return picked.map((card) => ({
      badge: card.badge,
      title: card.headline,
      sub: card.subtext,
      // 테크 뉴스(외부)만 새 탭 링크. originalUrl null 이면 링크 비활성(§2-2).
      url: badge === '테크 뉴스' ? card.originalUrl : null,
    }));
  });
}

// 홈 IT 인사이트 카드 (GET /api/v1/home/tech-cards).
// 인증 불필요·파라미터 없음 → 단순 useQuery. withCredentials 는 전역 설정(axios.ts:35).
// envelope 는 자동 언랩되지 않으므로(axios.ts:39) res.data.result 로 접근.
export function useTechCards() {
  return useQuery<TechCardsResult>({
    queryKey: ['home', 'tech-cards'],
    // 하루 1회 집계성 데이터라 길게. 정책은 조정 가능(명세 §4-1).
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const res = await apiClient.get<{ result: RawTechCardsResult }>(
        '/api/v1/home/tech-cards',
      );
      return normalizeTechCardsResult(res.data.result);
    },
  });
}
