interface StepIndicatorProps {
  steps: readonly string[];
  current: number; // 0-based
}

export default function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, idx) => {
        const isDone = idx < current;
        const isActive = idx === current;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isActive || isDone
                    ? 'bg-app-primary text-white'
                    : 'bg-app-bg text-app-text-muted border border-app-border'
                }`}
              >
                {idx + 1}
              </div>
              <span
                className={`text-xs ${
                  isActive ? 'text-app-text font-medium' : 'text-app-text-muted'
                }`}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`h-px w-8 ${idx < current ? 'bg-app-primary' : 'bg-app-border'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
