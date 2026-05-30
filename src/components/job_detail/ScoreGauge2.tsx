import { memo } from 'react';

interface ScoreGauge2Props {
  score: number;
}

function ScoreGauge2({ score }: ScoreGauge2Props) {
  const radius = 40;
  const strokeWidth = 6;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const svgSize = radius * 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={svgSize} height={svgSize} className="-rotate-90">
        <circle
          stroke="#E6E8EB"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#4741FF"
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
      <span className="absolute font-bold text-lg text-app-text">
        {score}
      </span>
    </div>
  );
}

export default memo(ScoreGauge2);