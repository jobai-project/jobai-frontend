import { memo, ReactNode } from 'react';

interface ScoreGauge2Props {
  score: number;
  children?: ReactNode;
}

function ScoreGauge2({ score, children }: ScoreGauge2Props) {
  const radius = 40;
  const strokeWidth = 13;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const svgSize = radius * 2;

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