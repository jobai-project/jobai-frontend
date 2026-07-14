import { useNavigate } from 'react-router-dom';
import { useConditionStore } from '@/stores/conditionStore';
import { useAuthStore } from '@/stores/authStore';

// 역할별 히어로 변형 (spec §1.2). ⚠️ 태그 텍스트가 역할 고정 라벨인지 사용자 직무 데이터인지
// 미확정 (spec §8.6): 일단 역할별 고정 라벨로 구현.
type HeroRole = 'developer' | 'designer' | 'planner';

// 배경 = 역할별 단일 PNG 1장(보라 그라디언트 + 일러스트 포함, §Phase2 1-4). 텍스트/필/버튼은
// 코드 오버레이. 경로는 public 루트(한글 파일명 그대로). 역할 소스 = conditionStore.jobRole.
// scale: PNG 4변 투명 여백(≈47px)을 카드 밖으로 밀어내 crop → 둥근 카드의 직사각 흰 테두리 제거.
// 개발자 PNG 만 여백 없는 full-bleed(1760×1224)라 확대 안 함(1). 나머지 2종은 여백 있어 1.08.
const ROLE_HERO: Record<HeroRole, { background: string; tag: string; scale: number }> = {
  developer: { background: '/개발자로그인컴포넌트.png', tag: '백엔드 개발자', scale: 1 },
  designer: { background: '/디자이너로그인컴포넌트.png', tag: '프로덕트 디자이너', scale: 1.08 },
  planner: { background: '/기획자로그인컴포넌트.png', tag: '서비스 기획자', scale: 1.08 },
};

export default function WelcomeCard() {
  const navigate = useNavigate();

  // 인사 문구 이름: Google OAuth 로그인 시 받아온 사용자 이름 (spec §1.1).
  const name = useAuthStore((s) => s.user?.name);

  // 역할 소스: 온보딩 Step 2에서 고른 값(conditionStore.jobRole)을 재사용 (spec §1.2).
  const jobRole = useConditionStore((s) => s.condition?.jobRole);
  const hero = ROLE_HERO[(jobRole as HeroRole) ?? 'developer'] ?? ROLE_HERO.developer;

  return (
    // 컨테이너 — w-440 h-306 rounded-16, overflow-hidden(카드 형태로 클립), shadow-homecard.
    <div className="relative h-[306px] w-[440px] flex-shrink-0 overflow-hidden rounded-2xl shadow-homecard">
      {/* 배경 = 역할별 PNG. absolute inset-0 + object-cover 로 카드 전체를 덮고, scale 로 살짝
          확대해 투명 여백을 crop. 컨테이너의 overflow-hidden 이 둥근 모서리로 클립. */}
      <img
        src={hero.background}
        alt=""
        aria-hidden
        draggable={false}
        style={{ transform: `scale(${hero.scale})` }}
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-center"
      />
      {/* 콘텐츠 — 배경 위(z-10). origin left-28 top-42, 내부 w-350, 타이틀↔버튼 gap-52 */}
      <div className="absolute left-[28px] top-[42px] z-10 flex w-[350px] flex-col gap-[52px]">
        <div className="flex flex-col gap-4">
          {/* 인사 2행 — PASS: 28/-0.56px/140%/#FFF, 1행 SemiBold(600) · 2행 Medium(500). */}
          <h2 className="text-white">
            <span className="block font-pretendard text-[28px] font-semibold leading-[140%] tracking-[-0.56px]">
              {name ?? '회원'} 님,
            </span>
            <span className="block font-pretendard text-[28px] font-medium leading-[140%] tracking-[-0.56px]">
              오늘도 잘하고 있어요
            </span>
          </h2>
          {/* 직무 배지 — px-14 py-8, pill(radius 100px), bg white/10, blur 2px, 12/400/130%/-0.24px. */}
          <span className="inline-flex items-center gap-1 self-start rounded-full bg-white/10 px-[14px] py-2 font-pretendard text-[12px] font-normal leading-[130%] tracking-[-0.24px] text-white backdrop-blur-[2px]">
            {hero.tag}
          </span>
        </div>

        {/* 이력서 관리 버튼 — pl-24 pr-28 py-10, rounded-16, gap-4, bg white/10, 14/500/150%/-0.28px.
            아이콘: 프로젝트에 아이콘 라이브러리가 없어 기존 public 에셋(edit-icon.png 24) 유지(§9-3). */}
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="inline-flex items-center gap-1 self-start rounded-2xl bg-white/10 py-2.5 pl-6 pr-7 font-pretendard text-[14px] font-medium leading-[150%] tracking-[-0.28px] text-white transition hover:bg-white/20"
        >
          <img src="/edit-icon.png" alt="" aria-hidden className="h-6 w-6" />
          이력서 관리
        </button>
      </div>
    </div>
  );
}
