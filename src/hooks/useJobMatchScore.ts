import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useRecommendedJobs } from '@/hooks/useInfiniteJobList';
import { useAuthStore } from '@/stores/authStore';
import type { JobSummary } from '@/types/jobApi';
import type { CompanyType } from '@/types/job';

// 상세 API 에는 matchScore 가 없다(Phase1 A1). 점수는 목록(recommended-jobs)에만 온다.
// → 3단 폴백으로 목록에서 상세로 전달한다. 반환 규칙: number(점수) / null(점수 없음·못 찾음).
//
//   1. location.state.matchScore   ← 목록 클릭 유입. 네트워크 0회
//   2. 세션 캐시(getQueriesData)     ← 같은 세션 내 이동. 네트워크 0회
//   3. recommended-jobs fetch        ← 새로고침·URL 직접 진입(캐시 소실). 로그인 시에만
//   4. 못 찾으면 null                ← 게스트·추천 목록 밖 공고 → ScoreGauge2 "??" 블러(A6)
//
// source+id 복합 매칭(id 는 source 별 로컬이라 단독 매칭 시 오매칭). 비로그인이면 3단계 skip.

type ListInfiniteData = InfiniteData<{ jobs: JobSummary[] }>;

// state 는 직접 진입 시 null, 목록 클릭 시 { matchScore }. 타입 단언 없이 안전 파싱.
// 반환: number | null = 목록이 준 확정값 / undefined = state 자체가 없음(다음 단계로).
function readStateScore(state: unknown): number | null | undefined {
  if (!state || typeof state !== 'object') return undefined;
  if (!('matchScore' in state)) return undefined;
  const v = (state as { matchScore: unknown }).matchScore;
  if (typeof v === 'number') return v;
  if (v === null) return null;
  return undefined;
}

// InfiniteData 의 모든 페이지를 훑어 source+id 로 find. 없으면 undefined.
function findScore(
  data: ListInfiniteData | undefined,
  source: CompanyType,
  jobId: number,
): number | null | undefined {
  if (!data) return undefined;
  for (const page of data.pages) {
    const hit = page.jobs.find((j) => j.source === source && j.id === jobId);
    if (hit) return hit.matchScore;
  }
  return undefined;
}

export function useJobMatchScore(
  source: CompanyType | undefined,
  jobId: number,
): number | null {
  const location = useLocation();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // 1) 라우터 state
  const stateScore = readStateScore(location.state);

  // 2) 세션 캐시 — filters 가 key 에 포함되므로 prefix 스캔(모든 filter 변형 조회).
  const cacheScore = useMemo(() => {
    if (!source || stateScore !== undefined) return undefined;
    const cached = queryClient.getQueriesData<ListInfiniteData>({
      queryKey: ['jobList', '/api/v1/home/recommended-jobs'],
    });
    for (const [, data] of cached) {
      const hit = findScore(data, source, jobId);
      if (hit !== undefined) return hit;
    }
    return undefined;
  }, [queryClient, source, jobId, stateScore]);

  // 3) fetch 폴백 — state·캐시 모두 실패 + 로그인 상태일 때만. filters 없이 기본 추천 목록.
  const needFetch =
    isAuthenticated &&
    !!source &&
    stateScore === undefined &&
    cacheScore === undefined;
  const { data: fetched } = useRecommendedJobs({}, needFetch);
  const fetchScore = source
    ? findScore(fetched as ListInfiniteData | undefined, source, jobId)
    : undefined;

  // undefined(미발견)는 다음 단계로. 전부 실패하면 null.
  const tier =
    stateScore !== undefined
      ? 1
      : cacheScore !== undefined
        ? 2
        : fetchScore !== undefined
          ? 3
          : 4;
  const resolved =
    stateScore !== undefined
      ? stateScore
      : cacheScore !== undefined
        ? cacheScore
        : (fetchScore ?? null);

  // ── V0 임시 계측 (런타임 검증 전용 · 검증 후 §5에서 전량 제거) ──────────
  // 개인정보/토큰 미포함. tier=어느 단계가 값을 냈는지 + 입력/결과.
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(`[matchScore] tier=${tier} source=${source} id=${jobId} → ${resolved}`);
    if (tier === 2 || tier === 4) {
      const keys = queryClient
        .getQueriesData<ListInfiniteData>({
          queryKey: ['jobList', '/api/v1/home/recommended-jobs'],
        })
        .map(([k]) => JSON.stringify(k));
      // eslint-disable-next-line no-console
      console.log(
        `[matchScore] scan keys(${keys.length}):`,
        keys,
        'picked:',
        tier === 2 ? 'this(cache hit)' : 'none',
      );
    }
    if (tier === 3) {
      // eslint-disable-next-line no-console
      console.log('[matchScore] tier3 fetch params:', {
        endpoint: '/api/v1/home/recommended-jobs',
        filters: {},
        offset: 0,
        size: 18,
      });
    }
  }, [tier, resolved, source, jobId, queryClient]);
  // ── /V0 ────────────────────────────────────────────────────────────────

  return resolved;
}
