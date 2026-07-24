import type { ScrapSource } from '@/types/scrap';

// GET /api/v1/notifications/matches/{batchId} 응답의 jobs[] 개별 항목
export interface NotificationMatchJob {
  id: number;
  source: ScrapSource; // 'PUBLIC' | 'PRIVATE'
  companyName: string;
  title: string;
  matchScore: number;
  dDay: number | null;
  location: string;
  employmentType: string;
  jobCategory?: string | null; // ⚠️ 현재 API 응답엔 없음 - 백엔드가 추가 예정
}

export interface NotificationMatchesResult {
  batchId: number;
  notificationType: string;
  count: number;
  createdAt: string;
  jobs: NotificationMatchJob[];
}