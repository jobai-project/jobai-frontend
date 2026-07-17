import { useState } from 'react';
import { useJobSummary } from '@/hooks/useJobSummary';
import AiSummaryCard from './AiSummaryCard';

interface JobSummarySectionProps {
  jobId: number; // 사기업 전용 — 부모가 source === 'PRIVATE' 일 때만 렌더
}

// 온디맨드 요약 섹션. 본문과 독립 — 버튼을 누르기 전엔 호출하지 않는다(enabled:false).
export default function JobSummarySection({ jobId }: JobSummarySectionProps) {
  const { data, refetch, isFetching, isError } = useJobSummary(jobId);
  const [requested, setRequested] = useState(false);

  const handleSummary = () => {
    setRequested(true);
    refetch();
  };

  // 완료 — 캐시로 유지되므로 data 있으면 결과 카드
  if (data) return <AiSummaryCard summary={data.summary} />;

  // 요약 소개 + 상태 버튼 카드 (클릭 전 / 로딩 / 에러)
  return (
    <div
      className="flex w-full flex-col items-start gap-4 self-stretch rounded-2xl border border-blue-100 p-5 shadow-[0_0_15.2px_0_rgba(118,85,255,0.12)]"
      style={{
        background:
          'radial-gradient(37.08% 60.83% at 96.7% 14.54%, rgba(115,84,255,0.07) 2.34%, rgba(255,255,255,0.07) 100%), #FFF',
      }}
    >
      <div className="flex flex-col items-start gap-2 self-stretch">
        <div className="flex items-center gap-2">
          <img src="/star.svg" alt="" aria-hidden className="h-6 w-6" />
          <h3 className="font-pretendard text-[20px] font-semibold leading-[140%] tracking-[-0.4px] text-black">
            AI 공고 요약
          </h3>
        </div>
        <p className="font-pretendard text-[14px] font-medium leading-[130%] tracking-[-0.28px] text-gray-700">
          {requested && isError
            ? '요약을 불러오지 못했어요. 다시 시도해 주세요.'
            : '긴 공고 내용을 핵심만 뽑아 정리해 드려요.'}
        </p>
      </div>

      {requested && isFetching ? (
        // §3 로딩 — bg-blue-500(불투명, /90 제거), 스피너→star 18px
        <div className="flex items-center justify-center gap-2 self-stretch rounded-[12px] bg-blue-500 px-[40px] py-[12px] text-white">
          {/* ❓ TODO: 로딩 애니메이션 유지 여부 확인 → 잠정 animate-pulse 유지 */}
          <img src="/star.svg" alt="" aria-hidden className="h-[18px] w-[18px] animate-pulse" />
          <span className="font-pretendard text-[16px] font-semibold">
            요약 생성 중...
          </span>
        </div>
      ) : (
        // §2 클릭 전 — "요약하기" + star 18px
        <button
          type="button"
          onClick={handleSummary}
          className="flex items-center justify-center gap-1.5 self-stretch rounded-[12px] bg-blue-500 px-[40px] py-[12px] font-pretendard text-[16px] font-semibold leading-[130%] tracking-[-0.32px] text-white transition hover:opacity-90"
        >
          {/* ❓ TODO: star 아이콘 정체 미확인(lucide Star 추정) → 기존 /star.svg 18px 사용 */}
          <img src="/star.svg" alt="" aria-hidden className="h-[18px] w-[18px]" />
          {requested && isError ? '다시 시도' : '요약하기'}
        </button>
      )}
    </div>
  );
}
