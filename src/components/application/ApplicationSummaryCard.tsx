import { PieChart, Pie, Cell } from 'recharts';
import {
  useApplicationSummary,
  useApplications,
} from '@/hooks/useApplications';

// 지원 현황 요약 카드 — 도넛(평균 진행도 %) + 총 지원 건수.
// - averageProgress(0~100)를 정수 반올림해 도넛/중앙 %로 표시 (G4).
// - "총 지원"은 API totalCalculatedCount(탈락·예정 제외)와 달라, 목록 길이를 사용 (G1).
export default function ApplicationSummaryCard() {
  const { data, isLoading, isError } = useApplicationSummary();
  const { data: list } = useApplications();

  if (isLoading) {
    return (
      <div className="h-[260px] w-[256px] animate-pulse rounded-[14px] bg-[#F2F4F6]" />
    );
  }
  if (isError || !data) {
    return (
      <div className="flex h-[260px] w-[256px] items-center justify-center rounded-[14px] border border-[#EBECFF] bg-white text-[12px] text-[#8995A2] shadow-[0_0_15.2px_rgba(118,85,255,0.06)]">
        요약을 불러오지 못했어요.
      </div>
    );
  }

  const progress = Math.round(data.averageProgress); // G4
  const totalCount = list?.applications.length ?? data.totalCalculatedCount; // G1
  const donut = [{ value: progress }, { value: 100 - progress }];

  return (
    <div className="w-[256px] rounded-[14px] border border-[#EBECFF] bg-white px-6 pb-5 pt-4 shadow-[0_0_15.2px_rgba(118,85,255,0.06)]">
      <div className="flex items-center gap-1.5">
        <img src="/percent-icon.png" alt="" aria-hidden className="h-6 w-6" />
        <span className="text-[15px] font-semibold text-[#171F29]">
          지원 현황 요약
        </span>
      </div>

      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="relative h-[150px] w-[150px]">
          <PieChart width={150} height={150}>
            <Pie
              data={donut}
              dataKey="value"
              innerRadius={55}
              outerRadius={72}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill="#4741FF" />
              <Cell fill="#EBECFF" />
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[#171F29]">
              <span className="text-[28px] font-semibold tracking-[-0.56px]">
                {progress}
              </span>
              <span className="text-[18px] font-semibold">%</span>
            </p>
            <p className="text-[14px] font-medium text-[#687685]">진행 중</p>
          </div>
        </div>
        <p className="text-[12px] text-[#8995A2]">
          {totalCount === 0 ? '아직 지원 내역이 없어요' : `총 지원 ${totalCount}건`}
        </p>
      </div>
    </div>
  );
}
