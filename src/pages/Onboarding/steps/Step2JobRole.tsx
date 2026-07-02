import { Dispatch } from 'react';
import { OnboardingState, ROLES, Role } from '../types';
import { OnboardingAction } from '../onboardingReducer';

interface StepProps {
  state: OnboardingState;
  dispatch: Dispatch<OnboardingAction>;
}

// 팬(부채꼴) 배치 근사 초기값 (spec §6/§7 — ⚠️ 육안 근사).
// TODO(디자이너 확인 — spec §10.1~3): rotate/z-index/x 오프셋 정확값 교체.
//   x  : 카드 중심의 좌우 오프셋(px). 카드 폭(≈318) 대비 겹치도록 설정.
//   y  : 기본 세로 오프셋(px). 중앙 카드가 살짝 위로 올라와 앞에 온다.
//   rot: 기본 회전(deg).  z: 기본 z-index(선택 시 3으로 덮어씀).
const CARD_GEOMETRY: Record<Role, { x: number; y: number; rot: number; z: number }> = {
  developer: { x: -120, y: 0, rot: -13, z: 1 },
  designer: { x: 0, y: -14, rot: 0, z: 2 },
  planner: { x: 120, y: 0, rot: 13, z: 1 },
};

// 선택 상태 강조 수치 (spec §7 — ⚠️ 근사, Figma 검증 필수 §10.3).
const SELECTED_SCALE = 1.05;
const SELECTED_LIFT = -8; // translateY(px)
const UNSELECTED_OPACITY = 0.4;

export default function Step2JobRole({ state, dispatch }: StepProps) {
  const select = (role: Role) =>
    dispatch({ type: 'SET_FIELD', key: 'jobRole', value: role });

  const anySelected = state.jobRole !== null;

  return (
    <div className="flex flex-col items-start gap-8 self-stretch">
      {/* 헤더 — Title 1 확정값 (spec §4.0): 28/600/140%/-0.56px/gray-900 #171F29.
          Figma frame width 784px는 반응형 카드(max 555px)라 미적용. */}
      <h2 className="font-pretendard text-[28px] font-semibold leading-[140%] tracking-[-0.56px] text-[#171F29]">
        희망하는 직무를
        <br />
        선택해주세요.
      </h2>

      {/* 팬 카드 컨테이너 — 겹침·회전 위해 relative + 카드 absolute. 카드가 부모
          밖으로 넘치도록 overflow-visible (spec §3.2 음수 offset = 넘침). */}
      <div className="relative h-[300px] w-full self-stretch overflow-visible">
        {ROLES.map((role) => {
          const isSelected = state.jobRole === role.key;
          const geom = CARD_GEOMETRY[role.key];
          const y = geom.y + (isSelected ? SELECTED_LIFT : 0);
          const scale = isSelected ? SELECTED_SCALE : 1;

          // 회전을 유지하면서 중앙 정렬(-50%,-50%) + 오프셋 + 확대·상승 합성 (spec §7 권장).
          const transform =
            `translate(calc(-50% + ${geom.x}px), calc(-50% + ${y}px)) ` +
            `rotate(${geom.rot}deg) scale(${scale})`;

          return (
            <button
              key={role.key}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${role.label} 선택`}
              onClick={() => select(role.key)}
              className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center bg-contain bg-center bg-no-repeat transition-[transform,opacity] duration-200 ease-out"
              style={{
                // spec §3.1 확정 크기 (팬 배치라 px 고정 — 그리드 카드 아님).
                width: '317.84px',
                height: '213.287px',
                aspectRatio: '76 / 51',
                transform,
                // 선택 없으면 전부 불투명. 선택 시 선택 카드만 불투명, 나머지는 흐릿.
                opacity: anySelected && !isSelected ? UNSELECTED_OPACITY : 1,
                zIndex: isSelected ? 3 : geom.z,
                // 배경 = 카드 배경 PNG (한글 파일명 절대경로, spec §2). 전경 아이콘은
                // 아래 <img>로 오버레이 (배경/전경 합성 방식은 spec §10.6 확인 필요).
                backgroundImage: `url("${role.bg}")`,
              }}
            >
              <img
                src={role.icon}
                alt=""
                aria-hidden
                className="pointer-events-none h-[112px] w-[112px] object-contain"
              />
              {/* 라벨: 배경/전경 PNG에 텍스트가 없어 오버레이로 렌더.
                  TODO(디자이너 확인 §10.6): 라벨 위치/색상. 보라 배경 대비 흰색 잠정. */}
              <span className="pointer-events-none mt-1 font-pretendard text-sm font-medium leading-[150%] tracking-[-0.28px] text-white">
                {role.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
