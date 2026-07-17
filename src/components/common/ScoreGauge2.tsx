import { memo, ReactNode } from 'react';

interface ScoreGauge2Props {
  score: number | null; // null = 점수 없음(스코어링 미실행) → 블러 "??" (C1=B)
  children?: ReactNode;
  // 도넛 지름(px). 기본 80(ScrapTable 회귀 방지). 상세 카드(ScoreBox)는 Figma 92 전달.
  // r·stroke 는 size 에 비례(기존 40/13 비율 유지).
  size?: number;
}

function ScoreGauge2({ score, children, size = 80 }: ScoreGauge2Props) {
  const radius = size / 2;
  const strokeWidth = (13 / 80) * size;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const svgSize = radius * 2;

  // 점수 없음 → 트랙만 블러 처리 + "??" (JobCard:53-80 처리를 이 치수에 맞춤).
  // TODO(D2): 테이블 셀 크기의 "??" 블러 시각 사양 디자이너 확인 필요.
  if (score === null) {
    return (
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={svgSize}
          height={svgSize}
          className="-rotate-90 scale-y-[-1] blur-[2px]"
        >
          <circle
            stroke="#E6E8EB"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute flex items-baseline justify-center text-app-text">
          <span className="text-lg font-bold">??</span>
        </div>
      </div>
    );
  }

  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={svgSize} height={svgSize} className="-rotate-90 scale-y-[-1]">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9C83FF" />
            <stop offset="100%" stopColor="#3344FF" />
          </linearGradient>
        </defs>

        <circle
          stroke="#E6E8EB"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="url(#gaugeGradient)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-500"
        />
      </svg>

      <div className="absolute flex items-baseline justify-center text-app-text">
        {children || (
          <span className="text-lg font-bold">{score}</span>
        )}
      </div>
    </div>
  );
}

export default memo(ScoreGauge2);