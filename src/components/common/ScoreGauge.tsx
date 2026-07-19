import { useId } from 'react';

type Variant = 'circle' | 'bar' | 'semicircle';
type Size = 'sm' | 'md' | 'lg';

interface ScoreGaugeProps {
  score: number;
  variant?: Variant;
  label?: string;
  size?: Size;
}

const CIRCLE_SIZE: Record<Size, { box: string; r: number; stroke: number; text: string }> = {
  sm: { box: 'h-12 w-12', r: 20, stroke: 5, text: 'text-sm' },
  md: { box: 'h-16 w-16', r: 28, stroke: 6, text: 'text-base' },
  lg: { box: 'h-20 w-20', r: 36, stroke: 7, text: 'text-lg' },
};

const BAR_SIZE: Record<Size, { track: string; label: string; score: string }> = {
  sm: { track: 'h-1.5', label: 'text-xs', score: 'text-xs' },
  md: { track: 'h-2', label: 'text-[13px]', score: 'text-sm' },
  lg: { track: 'h-2.5', label: 'text-sm', score: 'text-base' },
};

function scoreColor(score: number): {
  stroke: string;
  bar: string;
  text: string;
} {
  if (score >= 90) {
    return {
      stroke: '#0F766E',
      bar: 'bg-gradient-to-r from-teal-700 to-teal-500',
      text: 'text-teal-700',
    };
  }
  if (score >= 70) {
    return {
      stroke: '#1D4ED8',
      bar: 'bg-gradient-to-r from-blue-700 to-blue-500',
      text: 'text-blue-700',
    };
  }
  return {
    stroke: '#6B7280',
    bar: 'bg-gradient-to-r from-gray-500 to-gray-400',
    text: 'text-gray-500',
  };
}

export default function ScoreGauge({
  score,
  variant = 'circle',
  label,
  size = 'md',
}: ScoreGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const color = scoreColor(clamped);
  const gradientId = useId();

  if (variant === 'semicircle') {
    const radius = 28;
    const circumference = Math.PI * radius;
    const offset = circumference * (1 - clamped / 100);
    // 아크 끝점(노브) 좌표 — 중심(40,40)·r28 상단 반원. 왼쪽(12,40)=0점 → 오른쪽(68,40)=100점.
    // 각도 a = π + (score/100)·π (SVG y-down 기준). 검증: 0→좌, 50→상단, 100→우.
    const knobAngle = Math.PI * (1 + clamped / 100);
    const knobX = 40 + radius * Math.cos(knobAngle);
    const knobY = 40 + radius * Math.sin(knobAngle);

    return (
      <div className="relative h-14 w-20 flex-shrink-0">
        <svg viewBox="0 0 80 50" className="h-full w-full">
          <defs>
            {/* 좌(보라)→우(파랑). 우측 끝=dot쪽=파랑 */}
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#AD81FF" />
              <stop offset="100%" stopColor="#4741FF" />
            </linearGradient>
          </defs>
          <path
            d="M 12 40 A 28 28 0 0 1 68 40"
            fill="none"
            stroke="#D0D6DD"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 12 40 A 28 28 0 0 1 68 40"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
          {/* 끝점 노브 — 진행 아크 끝에 위치. fill 파랑 + 흰 테두리 */}
          <circle cx={knobX} cy={knobY} r={4} fill="#4741FF" stroke="#FFFFFF" strokeWidth={1.25} />
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex items-baseline justify-center">
          <span className="text-base font-bold text-app-text">{clamped}</span>
          <span className="ml-0.5 text-[10px] text-app-text-muted">점</span>
        </div>
      </div>
    );
  }

  if (variant === 'bar') {
    const s = BAR_SIZE[size];
    return (
      <div className="flex items-center gap-2">
        {label && (
          <span className={`flex-shrink-0 font-medium text-app-text-muted ${s.label}`}>
            {label}
          </span>
        )}
        <div className={`flex-1 overflow-hidden rounded-full bg-app-gauge-track ${s.track}`}>
          <div
            className={`h-full rounded-full transition-all ${color.bar}`}
            style={{ width: `${clamped}%` }}
          />
        </div>
        <span className={`flex-shrink-0 font-bold ${color.text} ${s.score}`}>
          {clamped}
        </span>
      </div>
    );
  }

  const s = CIRCLE_SIZE[size];
  const circumference = 2 * Math.PI * s.r;
  const dashOffset = circumference * (1 - clamped / 100);
  const viewSize = (s.r + s.stroke) * 2;

  return (
    <div className={`relative flex-shrink-0 ${s.box}`}>
      <svg viewBox={`0 0 ${viewSize} ${viewSize}`} className="h-full w-full -rotate-90">
        <circle
          cx={viewSize / 2}
          cy={viewSize / 2}
          r={s.r}
          fill="none"
          stroke="#E5E5E5"
          strokeWidth={s.stroke}
        />
        <circle
          cx={viewSize / 2}
          cy={viewSize / 2}
          r={s.r}
          fill="none"
          stroke={color.stroke}
          strokeWidth={s.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div
        className={`absolute inset-0 flex items-center justify-center font-bold text-app-text ${s.text}`}
      >
        {clamped}
      </div>
    </div>
  );
}
