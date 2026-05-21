import SummaryCard from './SummaryCard';

export default function SummaryRow() {
  return (
    <section className="mb-9 grid grid-cols-3 gap-4">
      <SummaryCard
        title="📌 스크랩 마감일자"
        to="/deadline"
        items={[
          '토스 백엔드 개발자 · D-2',
          '네이버 AI 엔지니어 · D-5',
          '카카오 프론트엔드 · D-7',
        ]}
      />
      <SummaryCard
        title="🏆 스크랩 순위"
        to="/ranking"
        items={['1. Python · 12회', '2. Django · 9회', '3. AWS · 7회']}
      />
      <SummaryCard
        title="📊 시장 인사이트"
        to="/insight"
        items={[
          '백엔드 공고 전주 대비 +18%',
          'AI 직무 평균 경력 3.2년',
          '이번 주 신규 공고 142건',
        ]}
      />
    </section>
  );
}
