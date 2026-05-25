export interface AINewsItem {
  title: string;
  summary: string;
}

export const mockAINews: AINewsItem[] = [
  {
    title: '생성형 AI, 채용 시장 새 표준으로',
    summary: '국내 IT 기업 70% 이상이 AI 코딩 어시스턴트 도입을 검토 중',
  },
  {
    title: '백엔드 신규 공고, 전주 대비 +18%',
    summary: 'Python·Go 직무가 성장세를 주도, 클라우드 경험 우대 비율 증가',
  },
  {
    title: '공공기관 IT 채용 확대',
    summary: '디지털 전환 기조로 2026년 상반기 공기업 전산직 채용 규모 30% 확대',
  },
];
