import { Fragment } from 'react';

interface StepIndicatorProps {
  steps: readonly string[];
  current: number; // 0-based
}

// Figma 1단계 §2/§3: 프로스티드 스텝 카드.
// padding 20/40, justify-between, rounded-16, bg white 50%, 온보딩 글로우 섀도.
// 스텝 사이는 graynext.svg(>)로 구분. 라벨 타이포는 SubTitle 2.
export default function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between self-stretch rounded-2xl bg-white/50 px-10 py-5 shadow-[0_0_24px_0_rgba(51,68,255,0.12)]">
      {steps.map((label, idx) => {
        const isActive = idx === current;
        return (
          <Fragment key={label}>
            <div className="flex items-center gap-2">
              {/* 번호 뱃지: 활성 = 파란 원, 비활성 = 회색 원 */}
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white ${
                  isActive ? 'bg-[#4741FF]' : 'bg-[#AFB8C2]'
                }`}
              >
                {idx + 1}
              </span>
              {/* SubTitle 2: Pretendard 18 / 500 / 150% / -0.36px */}
              <span
                className={`font-pretendard text-[18px] font-medium leading-[150%] tracking-[-0.36px] ${
                  isActive ? 'text-[#4741FF]' : 'text-[#AFB8C2]'
                }`}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <img src="/graynext.svg" alt="" aria-hidden className="h-6 w-6 shrink-0" />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
