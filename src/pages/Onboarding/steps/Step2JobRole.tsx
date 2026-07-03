import { Dispatch, useEffect } from 'react';
import { OnboardingState, ROLES, Role } from '../types';
import { OnboardingAction } from '../onboardingReducer';

// 카드 이미지는 import로만 참조(spec §2.3). 번들러가 한글 파일명을 안전한 해시
// 파일명으로 변환 → URL 인코딩 이슈 원천 차단 + 빌드 산출물에 포함.
import devSolid from '@/assets/onboarding/개발자카드.png';
import devTrans from '@/assets/onboarding/개발자투명카드.png';
import dsnSolid from '@/assets/onboarding/디자이너카드.png';
import dsnTrans from '@/assets/onboarding/디자이너투명카드.png';
import plnSolid from '@/assets/onboarding/기획자카드.png';
import plnTrans from '@/assets/onboarding/기획자투명카드.png';

// 역할별 solid/투명 카드 (선택=solid, 미선택=투명). 회전·카드 모양·아이콘·라벨은
// 모두 PNG 안에 그려져 있으므로 CSS 회전/오버레이 없이 이미지만 교체한다(spec §1·§5).
const CARD_IMAGES: Record<Role, { solid: string; transparent: string }> = {
  developer: { solid: devSolid, transparent: devTrans },
  designer: { solid: dsnSolid, transparent: dsnTrans },
  planner: { solid: plnSolid, transparent: plnTrans },
};

// 부채꼴 배치 — 위치(left/top/width)와 겹침 순서(z)만 제어(spec §1·§5).
// z = 눈에 보이는 앞뒤 순서와 일치: 가운데(앞)를 가장 높게. 투명 PNG도 요소는
// 직사각형 박스라, z 높은 박스가 이웃 카드 그림 위 클릭을 가로챈다(spec §5-2).
// ⚠️ left/top/width는 추정값. Figma Dev Mode 실측 후 확정(spec §6.3).
const CARD_LAYOUT: Record<Role, { pos: string; z: number }> = {
  developer: { pos: 'left-[2%]  top-[12%] w-[38%]', z: 10 }, // 왼쪽·뒤
  designer: { pos: 'left-[31%] top-[4%]  w-[38%]', z: 30 }, // 가운데·앞
  planner: { pos: 'left-[60%] top-[12%] w-[38%]', z: 10 }, // 오른쪽·뒤
};

interface StepProps {
  state: OnboardingState;
  dispatch: Dispatch<OnboardingAction>;
}

export default function Step2JobRole({ state, dispatch }: StepProps) {
  const select = (role: Role) =>
    dispatch({ type: 'SET_FIELD', key: 'jobRole', value: role });

  // 6장 프리로드: solid는 선택 전까지 렌더되지 않으므로, 첫 클릭 시 늦게 떠서
  // 깜빡이는 현상 방지(spec §5-3).
  useEffect(() => {
    Object.values(CARD_IMAGES).forEach(({ solid, transparent }) => {
      new Image().src = solid;
      new Image().src = transparent;
    });
  }, []);

  return (
    <div className="flex flex-col items-start gap-8 self-stretch">
      {/* 헤더 — Title 1 확정값(spec §4.0): 28/600/140%/-0.56px/gray-900 #171F29. */}
      <h2 className="font-pretendard text-[28px] font-semibold leading-[140%] tracking-[-0.56px] text-[#171F29]">
        희망하는 직무를
        <br />
        선택해주세요.
      </h2>

      {/* 팬 카드 컨테이너 — 카드 절대 위치 기준. top-% 가 의미를 가지도록 aspect 고정.
          선택 카드가 살짝 넘쳐도 잘리지 않게 overflow-visible. */}
      <div className="relative w-full self-stretch aspect-[520/360] overflow-visible">
        {ROLES.map(({ key, label }) => {
          const isSelected = state.jobRole === key;
          // 아무 카드도 선택 안 된 초기 상태(jobRole===null)에서는 셋 다 투명 =
          // "골라주세요" 신호(spec §6.2 후보 A). ⚠️ 초기 선택 상태는 미확정 TODO.
          const src = isSelected
            ? CARD_IMAGES[key].solid
            : CARD_IMAGES[key].transparent;
          const { pos, z } = CARD_LAYOUT[key];

          return (
            <button
              key={key}
              type="button"
              onClick={() => select(key)}
              aria-pressed={isSelected}
              aria-label={`${label} 선택`}
              // 클릭은 바깥 button이 받도록 img는 pointer-events-none.
              className={`absolute ${pos} cursor-pointer border-0 bg-transparent p-0 transition-transform focus-visible:outline focus-visible:outline-2`}
              // 선택 카드를 맨 앞으로 끌어올려 뒤 카드에 가려지지 않게(spec §5-2).
              style={{ zIndex: isSelected ? 40 : z }}
            >
              {/* solid/투명 캔버스 비율이 미묘하게 달라(특히 디자이너 §6.1) 고정 박스 안에서
                  object-contain으로 비율 유지. 이미지가 장식이라 alt="". */}
              <img
                src={src}
                alt=""
                draggable={false}
                className="pointer-events-none h-full w-full select-none object-contain"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
