import type { ScrapSource } from '@/types/scrap';

// GET /api/v1/notifications/matches/{batchId} 응답의 jobs[] 개별 항목
// (2026-07-24 실측 반영 — id가 아니라 jobId, dDay 대신 deadline만 제공)
export interface NotificationMatchJob {
  jobId: number;
  source: ScrapSource; // 'PUBLIC' | 'PRIVATE'
  companyName: string;
  title: string;
  matchScore: number;
  deadline: string | null; // yyyy-MM-dd. D-day는 프론트에서 계산해야 함
  location: string;
  employmentType: string;
  jobCategory: string | null; // PUBLIC은 실제로 null로 옴
  // ⚠️ 소문자(private/public)라 우리 라우트(/jobs/:source/:id)의 대문자 관례와
  // 안 맞음 — 링크 생성에 쓰지 않고 참고용으로만 남겨둠
  detailLinkUrl?: string;
}

export interface NotificationMatchesResult {
  batchId: number;
  notificationType: string;
  count: number;
  createdAt: string;
  jobs: NotificationMatchJob[];
}