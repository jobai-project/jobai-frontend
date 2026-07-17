import { memo } from 'react';
import ScoreGauge2 from '../common/ScoreGauge2';

interface ScoreBoxProps {
  // null = 점수 없음(게스트·추천 목록 밖 공고) → ScoreGauge2 "??" 블러(Phase1 A6).
  score: number | null;
}

// Figma 1428:14168 "AI 공고 점수" 카드. 점수는 목록에서 전달받음(useJobMatchScore).
function ScoreBox({ score }: ScoreBoxProps) {
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

        {/* TODO(D1): 근거 불릿 4개 데이터 소스 미확정 — 백엔드 확인 대기(Phase1 A3/A5).
            아래 문구는 하드코딩 mock(Figma 문구가 여기서 역수입됨) → 렌더 금지, 삭제도 금지.
        <div className="flex-1 space-y-2 text-[13px] font-medium text-slate-600 leading-tight">
          <div className="flex items-start gap-1"><span className="text-slate-400">·</span><span>기술 스택 Python, Django, AWS 일치 (매칭 3/5개)</span></div>
          <div className="flex items-start gap-1"><span className="text-slate-400">·</span><span>경력 3년 요구 중 2년 보유</span></div>
          <div className="flex items-start gap-1"><span className="text-slate-400">·</span><span>백엔드 직무 일치</span></div>
          <div className="flex items-start gap-1"><span className="text-slate-400">·</span><span>요구사항 80% 충족</span></div>
        </div>
        */}
      </div>
    </div>
  );
}

export default memo(ScoreBox);
