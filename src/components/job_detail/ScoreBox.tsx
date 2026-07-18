import { memo } from 'react';
import ScoreGauge2 from '../common/ScoreGauge2';

interface ScoreBoxProps {
  // null = 점수 미산출(이력서 미임베딩/scoring 전) → ScoreGauge2 "??" 블러(Phase1 A6).
  score: number | null;
  // 상세 API scoreReason(개행 구분). 미산출 시 null → 근거 영역 미렌더.
  reason?: string | null;
}

// Figma 1428:14168 "AI 공고 점수" 카드. 점수는 상세 응답(job.matchScore)에서 전달받음.
function ScoreBox({ score, reason }: ScoreBoxProps) {
  // 개행 분리 → 공백 제거 → 빈 줄 제거. 인덱스 하드코딩 없이 항목 수에 무관하게 렌더.
  const reasons = (reason ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div
      className="flex flex-col gap-[16px] rounded-[16px] border border-blue-100 p-[20px] shadow-homecard"
      style={{
        background:
          'radial-gradient(37.08% 60.83% at 96.7% 14.54%, rgba(115,84,255,0.07) 2.34%, rgba(255,255,255,0.07) 100%), #FFF',
      }}
    >
      <div className="flex items-center gap-2">
        <img src="/star.svg" alt="" aria-hidden className="h-6 w-6" />
        <h4 className="font-pretendard text-[20px] font-semibold leading-[1.4] tracking-[-0.4px] text-black">
          AI 공고 점수
        </h4>
      </div>

      <div className="flex items-center gap-7">
        <div className="flex-shrink-0">
          {/* 도넛 92px(Figma 91.94). null 이면 ScoreGauge2 가 "??" 블러 렌더 → children 무시 */}
          <ScoreGauge2 score={score} size={92}>
            <div className="flex items-baseline">
              <span className="text-[20px] font-medium tracking-[-0.4px] text-gray-900">
                {score}
              </span>
              <span className="text-[14px] font-normal tracking-[-0.28px] text-gray-900">
                점
              </span>
            </div>
          </ScoreGauge2>
        </div>

        {/* 근거 리스트(Figma 1428:14182) — 도넛과 gap-28(items-center). scoreReason 개행 항목.
            reason 없음(PUBLIC·미산출)이면 미렌더. 마커 '・'(U+30FB), 14 Medium gray-700, gap-8. */}
        {reasons.length > 0 && (
          <ul className="flex min-w-0 flex-1 flex-col gap-[8px]">
            {reasons.map((line, i) => (
              <li
                key={i}
                className="flex items-start font-pretendard text-[14px] font-medium leading-[1.3] tracking-[-0.28px] text-gray-700"
              >
                <span aria-hidden>・</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default memo(ScoreBox);
