import { memo } from 'react';
import ScoreGauge2 from '../common/ScoreGauge2';

interface ScoreBoxProps {
  score: number;
}
 
function ScoreBox({ score }: ScoreBoxProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-[#EBECFF]/90 bg-white p-6 shadow-[0_15px_50px_rgba(124,119,255,0.15)]">
        <div className="flex items-center gap-2 mb-6">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#4741FF]">
            <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h4 className="text-lg font-bold text-app-text">AI 공고 점수</h4>
        </div>

        <div className="flex items-center gap-7 h-full min-h-0 pl-4">
            <div className="flex-shrink-0">
                <ScoreGauge2 score={score} />
            </div>

            <div className="flex-1 space-y-2 text-[13px] font-medium text-slate-600 leading-relaxed leading-tight">
                <div className="flex items-start gap-1">
                  <span className="text-slate-400">·</span>
                  <span>기술 스택 Python, Django, AWS 일치 (매칭 3/5개)</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-slate-400">·</span>
                  <span>경력 3년 요구 중 2년 보유</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-slate-400">·</span>
                  <span>백엔드 직무 일치</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-slate-400">·</span>
                  <span>요구사항 80% 충족</span>
                </div>
            </div>
        </div>
    </div>
  );
}
 
export default memo(ScoreBox);