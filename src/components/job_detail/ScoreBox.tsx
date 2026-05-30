import { memo } from 'react';
import ScoreGauge2 from './ScoreGauge2';

interface ScoreBoxProps {
  score: number;
}
 
function ScoreBox({ score }: ScoreBoxProps) {
  return (
    <div className="flex items-start gap-6 rounded-xl border border-app-border bg-white p-6">
        <div className="flex-shrink-0">
            <ScoreGauge2 score={score} />
        </div>

        <div className="flex-1 space-y-3 text-sm">
            <div>
                <div className="text-app-text font-semibold">
                  • Python, Django, AWS 요구 중 3개 일치
                </div>
            </div>
            <div>
                <div className="text-app-text font-semibold">
                  • 경력 3년 요구 중 2년 보유
                </div>
            </div>
            <div>
                <div className="text-app-text font-semibold">
                  • 필수 자격요건 100% 충족
                </div>
            </div>
        </div>
    </div>
  );
}
 
export default memo(ScoreBox);