import type { CompanyType } from '@/types/job';

/** 공고 출처. JobSummary.source(CompanyType)와 동일 — 재사용(v3 §6-1). */
export type ScrapSource = CompanyType; // 'PUBLIC' | 'PRIVATE'

/** 스크랩 정본 키. scrapId가 아니라 이것을 쓴다 (G8). */
export type ScrapKey = `${ScrapSource}:${number}`;
export const toScrapKey = (source: ScrapSource, sourceId: number): ScrapKey =>
  `${source}:${sourceId}`;

/* ── 서버 원본 (normalize 전) ───────────────────────── */
// S1: GET /api/v1/scraps → result.scraps[]
export interface RawScrapItem {
  scrapId: number; // ⚠️ 프론트 미사용 (G8)
  source: ScrapSource;
  sourceId: number;
  companyName: string;
  title: string;
  location: string;
  employmentType: string;
  dDay: number | null; // 마감 공고는 음수 가능
  scrappedAt: string;
  // matchScore 는 G9로 아직 응답에 없음 → normalize에서 as any 로 흡수(TODO(G9))
}

// S3: GET /api/v1/scraps/upcoming-deadlines → scraps[]
export interface RawUpcomingScrap {
  scrapId: number;
  source: ScrapSource;
  sourceId: number;
  companyName: string;
  title: string;
  location: string;
  employmentType: string;
  deadline: string; // "yyyy-MM-dd" — S1에는 없는 필드 (G4)
  scrappedAt: string;
  dday?: number | null; // 🔴 소문자 (G1)
  dDay?: number | null; // 🔴 S1은 대문자. 양쪽 수용 (G1)
}

/* ── 프론트 정규화 모델 ─────────────────────────────── */
export interface Scrap {
  key: ScrapKey;
  source: ScrapSource;
  sourceId: number;
  companyName: string;
  title: string;
  location: string;
  employmentType: string;
  matchScore: number | null; // G9: S1 미제공 → 현재 항상 null. 백엔드 추가 시 자동 반영
  dDay: number | null;
  deadline: string | null; // S1에서는 항상 null (G4)
  scrappedAt: string;
}

// S2 요청/응답
export interface CreateScrapRequest {
  source: ScrapSource;
  sourceId: number;
}
export interface CreateScrapResponse {
  scrapId: number;
}

// 단건 토글 변수 (v2 §5.2 확정본: 추가 시 호출부가 optimistic 데이터 전달)
export interface ToggleScrapVars {
  source: ScrapSource;
  sourceId: number;
  scrapped: boolean; // 현재 스크랩 상태 (true → 취소, false → 추가)
  optimistic?: Scrap; // 추가 시 목록에 낙관적으로 넣을 데이터(카드/행에서 구성)
}
