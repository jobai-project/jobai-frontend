import { CSSProperties, Dispatch } from 'react';
import { OnboardingState, ROLES, Role } from '../types';
import { OnboardingAction } from '../onboardingReducer';

interface StepProps {
  state: OnboardingState;
  dispatch: Dispatch<OnboardingAction>;
}

// 부채꼴 배치 (spec §6). 회전·카드 모양은 배경 PNG에 이미 포함되어 있으므로
// CSS rotate/border-radius는 쓰지 않고, 절대 위치 + z-index로만 겹침을 만든다.
//   pos     : 절대 위치(컨테이너 기준). centered=true면 left:50% + translateX(-50%).
//   centered: 중앙 카드(가로 중앙 정렬) 여부.
//   z       : 기본 z-index(선택 시 3으로 덮어씀).
// ⚠️ top/left는 "일단 그려지게 하는 근사 시작값"이며 Figma 명시값 없음 → 육안 조정 필요
//    (TODO 디자이너 확인 — spec §10.1~2).
const CARD_LAYOUT: Record<
  Role,
  { pos: CSSProperties; centered: boolean; z: number }
> = {
  developer: { pos: { left: 0, top: 12 }, centered: false, z: 1 },
  designer: { pos: { left: '50%', top: 0 }, centered: true, z: 2 },
  planner: { pos: { right: 0, top: 12 }, centered: false, z: 1 },
};

// 선택 상태 강조 수치 (spec §7 — ⚠️ 근사, Figma 검증 필수 §10.3).
const SELECTED_SCALE = 1.05;
const SELECTED_LIFT = -8; // translateY(px)
const UNSELECTED_OPACITY = 0.4;

export default function Step2JobRole({ state, dispatch }: StepProps) {
  const select = (role: Role) =>
    dispatch({ type: 'SET_FIELD', key: 'jobRole', value: role });

  return (
    <div className="flex flex-col items-start gap-8 self-stretch">
      {/* 헤더 — Title 1 확정값 (spec §4.0): 28/600/140%/-0.56px/gray-900 #171F29.
          Figma frame width 784px는 반응형 카드(max 555px)라 미적용. */}
      <h2 className="font-pretendard text-[28px] font-semibold leading-[140%] tracking-[-0.56px] text-[#171F29]">
        희망하는 직무를
        <br />
        선택해주세요.
      </h2>

      {/* 팬 카드 컨테이너 — 겹침 위해 relative + 카드 absolute. 선택 시 확대·상승이
          넘치도록 overflow-visible. 회전은 배경 이미지에 포함(§6). */}
      <div className="relative h-[260px] w-full self-stretch overflow-visible">
        {ROLES.map((role) => {
          // 아무 카드도 선택 안 된 초기 상태에서는 세 장 모두 선명해야 한다(§7).
          // 다른 카드가 선택된 경우에만 이 카드를 흐리게.
          const isSelected = state.jobRole === role.key;
          const isDimmed = state.jobRole !== null && !isSelected;
          const layout = CARD_LAYOUT[role.key];

          // 회전 없음(배경 PNG에 포함). 중앙 정렬 translateX(-50%)에 선택 확대·상승을
          // transform으로 한 번에 합성 (spec §7: transform 합성 허용).
          const parts: string[] = [];
          if (layout.centered) parts.push('translateX(-50%)');
          if (isSelected) parts.push(`scale(${SELECTED_SCALE})`, `translateY(${SELECTED_LIFT}px)`);
          const transform = parts.length ? parts.join(' ') : undefined;

          return (
            <button
              key={role.key}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${role.label} 선택`}
              onClick={() => select(role.key)}
              // 카드 내부: 아이콘 → 라벨 세로 스택, 가운데 정렬, gap 12.271px (§5 확정).
              // border-radius/overflow 클리핑 없음 — 기울어진 카드가 잘려 깨짐 방지(§2).
              className="absolute flex flex-col items-center justify-center gap-[12.271px] bg-contain bg-center bg-no-repeat transition-[transform,opacity] duration-200 ease-out"
              style={{
                ...layout.pos,
                // spec §3.1 확정 크기 (팬 배치라 px 고정 — 그리드 카드 아님).
                // 배경 PNG(912×612)와 카드 비율(76/51)이 같아 contain으로 왜곡 없음.
                width: '317.84px',
                height: '213.287px',
                aspectRatio: '76 / 51',
                transform,
                opacity: isDimmed ? UNSELECTED_OPACITY : 1,
                zIndex: isSelected ? 3 : layout.z,
                // 배경 = 카드 배경 PNG (회전·카드 모양 포함, 한글 파일명 절대경로 §2).
                backgroundImage: `url("${role.bg}")`,
              }}
            >
              {/* 전경 아이콘: 정면(회전 없음), 카드 중앙 오버레이(§2).
                  ⚠️ 아이콘 크기(내부 118×160 박스가 아이콘만인지 묶음인지) 확인 필요 §10.4. */}
              <img
                src={role.icon}
                alt=""
                aria-hidden
                className="pointer-events-none h-[112px] w-[112px] object-contain"
              />
              {/* 라벨: 배경/전경 PNG에 텍스트가 없어 오버레이. 보라 배경 대비 흰색.
                  본문 폰트 §4.1 (14/500/150%/-0.28px). ⚠️ 라벨 색상 확인 필요 §10. */}
              <span className="pointer-events-none font-pretendard text-sm font-medium leading-[150%] tracking-[-0.28px] text-white">
                {role.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
