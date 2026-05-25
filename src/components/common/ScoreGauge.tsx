type Variant = 'circle' | 'bar';
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
