import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import {
  getScraps,
  createScrap,
  deleteScrap,
  getUpcomingDeadlineScraps,
} from '@/api/scraps';
import type { Scrap, ScrapKey, ScrapSource, ToggleScrapVars } from '@/types/scrap';
import { toScrapKey } from '@/types/scrap';

const scrapKeys = {
  all: ['scraps'] as const,
  list: () => [...scrapKeys.all, 'list'] as const,
  upcoming: () => [...scrapKeys.all, 'upcoming'] as const,
};

/* ── 조회 ─────────────────────────────────────────── */
// 스크랩 목록 (마이페이지 스크랩 페이지 + 카드 아이콘 Set 소스). 로그인 시에만.
export const useScraps = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: scrapKeys.list(),
    queryFn: getScraps,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
};

// 카드용 파생 Set (§4.2). list() 캐시에서 파생 — 별도 소스 아님.
export const useScrapSet = (): Set<ScrapKey> => {
  const { data } = useScraps();
  return useMemo(() => new Set((data ?? []).map((s) => s.key)), [data]);
};

// 홈: 곧 마감되는 스크랩 (최대 3, 서버 정렬/필터/제한).
export const useUpcomingDeadlineScraps = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: scrapKeys.upcoming(),
    queryFn: getUpcomingDeadlineScraps,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
};

/* ── 단건 토글 (낙관적 + 롤백) ─────────────────────── */
export const useToggleScrap = () => {
  const qc = useQueryClient();
  return useMutation({
    // S2·S4 모두 멱등 → 연타/재시도 안전
    mutationFn: async ({ source, sourceId, scrapped }: ToggleScrapVars) =>
      scrapped
        ? deleteScrap(source, sourceId) // 켜져 있으면 → 취소
        : createScrap({ source, sourceId }).then(() => undefined),

    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: scrapKeys.list() });
      const prev = qc.getQueryData<Scrap[]>(scrapKeys.list());
      const key = toScrapKey(vars.source, vars.sourceId);

      qc.setQueryData<Scrap[]>(scrapKeys.list(), (old = []) => {
        if (vars.scrapped) return old.filter((s) => s.key !== key); // 취소
        if (old.some((s) => s.key === key)) return old; // 이미 있음(멱등)
        // 추가: 호출부가 준 optimistic 데이터(없으면 최소 stub) → onSettled invalidate가 정정
        const item: Scrap = vars.optimistic ?? {
          key,
          source: vars.source,
          sourceId: vars.sourceId,
          companyName: '',
          title: '',
          location: '',
          employmentType: '',
          matchScore: null,
          dDay: null,
          deadline: null,
          scrappedAt: new Date().toISOString(),
        };
        return [item, ...old];
      });
      return { prev };
    },

    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(scrapKeys.list(), ctx.prev); // 단건은 all-or-nothing → 롤백 정확
      // TODO: 토스트 "스크랩에 실패했어요. 다시 시도해주세요."
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: scrapKeys.list() });
      qc.invalidateQueries({ queryKey: scrapKeys.upcoming() });
    },
  });
};

/* ── 일괄 삭제 (§1.5) ──────────────────────────────── */
export const useDeleteScraps = () => {
  const qc = useQueryClient();
  return useMutation({
    // S4는 멱등 → 병렬·부분실패 안전
    mutationFn: async (keys: ScrapKey[]) => {
      const results = await Promise.allSettled(
        keys.map((k) => {
          const [source, id] = k.split(':') as [ScrapSource, string];
          return deleteScrap(source, Number(id));
        }),
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      if (failed > 0) throw new Error(`${failed}건 삭제 실패`);
    },
    onMutate: async (keys) => {
      await qc.cancelQueries({ queryKey: scrapKeys.list() });
      const prev = qc.getQueryData<Scrap[]>(scrapKeys.list());
      const set = new Set(keys);
      qc.setQueryData<Scrap[]>(scrapKeys.list(), (old = []) =>
        old.filter((s) => !set.has(s.key)),
      );
      return { prev };
    },
    // 🔴 부분 실패 시 전체 롤백하지 않는다 — 일부는 실제 삭제됨. invalidate가 서버 진실로 정정.
    onError: () => {
      // TODO: 토스트 "일부 항목을 삭제하지 못했어요."
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: scrapKeys.list() });
      qc.invalidateQueries({ queryKey: scrapKeys.upcoming() });
    },
  });
};
