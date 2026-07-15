import { apiClient } from '@/api/axios';
import type { ApiEnvelope } from '@/api/auth'; // TODO(A2): ApiResponse 부재 → auth의 것 재사용(3중 중복 통합은 별도)
import type {
  RawScrapItem,
  RawUpcomingScrap,
  Scrap,
  CreateScrapRequest,
  CreateScrapResponse,
  ScrapSource,
} from '@/types/scrap';
import { toScrapKey } from '@/types/scrap';

/* ── normalize ─────────────────────────────────────── */
export const normalizeScrap = (raw: RawScrapItem): Scrap => ({
  key: toScrapKey(raw.source, raw.sourceId),
  source: raw.source,
  sourceId: raw.sourceId,
  companyName: raw.companyName,
  title: raw.title,
  location: raw.location,
  employmentType: raw.employmentType,
  // TODO(G9): S1에 matchScore 없음 → 항상 null(블러 "??"). 백엔드 추가 시 RawScrapItem에 필드 선언하고 as any 제거
  matchScore: (raw as { matchScore?: number | null }).matchScore ?? null,
  dDay: raw.dDay ?? null,
  deadline: null, // S1은 deadline 미제공 (G4)
  scrappedAt: raw.scrappedAt,
});

export const normalizeUpcomingScrap = (raw: RawUpcomingScrap): Scrap => ({
  key: toScrapKey(raw.source, raw.sourceId),
  source: raw.source,
  sourceId: raw.sourceId,
  companyName: raw.companyName,
  title: raw.title,
  location: raw.location,
  employmentType: raw.employmentType,
  matchScore: (raw as { matchScore?: number | null }).matchScore ?? null, // TODO(G9)
  // TODO(G1): 백엔드가 dDay/dday 중 하나로 확정하면 반대쪽 제거
  dDay: raw.dDay ?? raw.dday ?? null,
  deadline: raw.deadline ?? null,
  scrappedAt: raw.scrappedAt,
});

/* ── S1: 내 스크랩 목록 ────────────────────────────── */
export const getScraps = async (): Promise<Scrap[]> => {
  const res = await apiClient.get<ApiEnvelope<{ scraps: RawScrapItem[] }>>(
    '/api/v1/scraps',
  );
  return (res.data.result?.scraps ?? []).map(normalizeScrap);
};

/* ── S2: 스크랩 추가 (멱등) ────────────────────────── */
export const createScrap = async (
  body: CreateScrapRequest,
): Promise<CreateScrapResponse> => {
  const res = await apiClient.post<ApiEnvelope<CreateScrapResponse>>(
    '/api/v1/scraps',
    body,
  );
  return res.data.result;
};

/* ── S3: 곧 마감되는 스크랩 (최대 3, 서버가 정렬·필터·제한) ───────────── */
export const getUpcomingDeadlineScraps = async (): Promise<Scrap[]> => {
  // TODO(G2): Swagger 200 예시에 공통 래퍼가 없음. 실측 후 한쪽으로 확정할 것.
  const res = await apiClient.get<{
    result?: { scraps?: RawUpcomingScrap[] };
    scraps?: RawUpcomingScrap[];
  }>('/api/v1/scraps/upcoming-deadlines');
  const list: RawUpcomingScrap[] = res.data?.result?.scraps ?? res.data?.scraps ?? [];
  return list.map(normalizeUpcomingScrap);
};

/* ── S4: 스크랩 취소 (멱등) ────────────────────────── */
export const deleteScrap = async (
  source: ScrapSource,
  sourceId: number,
): Promise<void> => {
  await apiClient.delete(`/api/v1/scraps/${source}/${sourceId}`);
};
