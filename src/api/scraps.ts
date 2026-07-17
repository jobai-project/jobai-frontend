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
  dDay: raw.dday ?? null, // 🔴 FIX(v5): raw.dDay → raw.dday (실측 확정 — "상시" 버그의 원인)
  deadline: raw.deadline ?? null, // 🔴 FIX(v5): S1도 deadline 제공(G4 오해 해소)
  matchScore: raw.matchScore ?? null, // 실측: S1 제공. 부재 시 null → 블러 폴백
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
  dDay: raw.dday ?? null, // G1 확정: dday(소문자) 단일
  deadline: raw.deadline ?? null,
  matchScore: raw.matchScore ?? null, // upcoming 실측 미확인이나 ?? null 폴백 안전
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