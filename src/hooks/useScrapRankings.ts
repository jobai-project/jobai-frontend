import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/axios';
import { normalizeScrapRanking } from '@/api/normalizeJob';
import type { RawScrapRankingsResult, ScrapRanking } from '@/types/jobApi';

// 홈 인기 스크랩 순위 (GET /api/v1/home/scrap-rankings).
// 인증 불필요·파라미터 없음 → 단순 useQuery(useTechCards 관례). 게스트/회원 홈 동일 호출.
// envelope 는 자동 언랩되지 않으므로(axios.ts:39) res.data.result 로 접근 → rankings 수동 추출.
export function useScrapRankings() {
  return useQuery<ScrapRanking[]>({
    queryKey: ['home', 'scrap-rankings'],
    // 집계성 데이터라 길게(tech-cards 와 동일 정책).
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const res = await apiClient.get<{ result: RawScrapRankingsResult }>(
        '/api/v1/home/scrap-rankings',
      );
      return res.data.result.rankings.map(normalizeScrapRanking);
    },
  });
}
