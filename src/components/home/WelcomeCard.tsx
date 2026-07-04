import { useNavigate } from 'react-router-dom';
import { useConditionStore } from '@/stores/conditionStore';
import { useAuthStore } from '@/stores/authStore';

// 카드 배경 — 일러스트가 합성되지 않은 순수 그라데이션+노이즈 (그림자 재현용 클린 배경).
// (겹침 진단 결과: 기존 User_card.png 배경에 개발자 `</>` 일러스트가 박혀 있어, 다른
//  직무에서 배경 일러스트 + 오버레이 일러스트가 동시에 보였음. 클린 배경으로 교체.)
// 프로젝트 규칙(dist 금지)에 따라 src/assets/ 에 두고 import.
import devBg from '@/assets/home/개발자배경.png';
import dsnBg from '@/assets/home/디자이너배경.png';
import plnBg from '@/assets/home/기획자배경.png';

// 역할별 히어로 변형 (spec §1.2). 일러스트는 public/ 영문 파일명 → 절대경로 참조(오버레이).
// ⚠️ 태그 텍스트가 역할 고정 라벨인지 사용자 직무 데이터인지 미확정 (spec §8.6):
// 일단 역할별 고정 라벨로 구현. TODO(확인 필요) 확정 후 교체.
type HeroRole = 'developer' | 'designer' | 'planner';
const ROLE_HERO: Record<
  HeroRole,
  { illustration: string; background: string; tag: string }
> = {
  developer: { illustration: '/dev-hero.png', background: devBg, tag: '백엔드 개발자' },
  designer: { illustration: '/designer-hero.png', background: dsnBg, tag: '프로덕트 디자이너' },
  planner: { illustration: '/planner-hero.png', background: plnBg, tag: '서비스 기획자' },
};

export default function WelcomeCard() {
  const navigate = useNavigate();

  // 인사 문구 이름: Google OAuth 로그인 시 받아온 사용자 이름 (spec §1.1).
  // TODO(백엔드 연동 필요): name 이 비어있을 때 폴백 정책 확정(현재 "회원").
  const name = useAuthStore((s) => s.user?.name);

  // 역할 소스: 온보딩 Step 2에서 고른 값(conditionStore.jobRole)을 재사용 (spec §1.2 ⚠️).
  // TODO(확인 필요): selectedRole 재사용이 맞는지 / 미선택 시 폴백('developer') 정책.
  const jobRole = useConditionStore((s) => s.condition?.jobRole);
  const hero = ROLE_HERO[(jobRole as HeroRole) ?? 'developer'] ?? ROLE_HERO.developer;

  return (
    // ⚠️ 이미지 범위 미확정(spec §8.5): *-hero.png 를 "우측 일러스트"로 가정하고
    // 클린 배경(*배경.png) 위에 오버레이. 카드 전체 배경이면 Figma 확인 후 교체.
    <div
      className="relative flex h-[306px] flex-col justify-between overflow-hidden rounded-[20px] p-10"
      style={{
        backgroundImage: `url(${hero.background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        boxShadow: '0 8px 24px rgba(99, 70, 220, 0.15)',
      }}
    >
      {/* 우측 3D 일러스트 (역할별) — 크기·위치 Figma 실측 확정(spec §5):
          232×234, absolute, right:-95, bottom:-11.
          ⚠️ overflow 정책 미확정(spec §1 ❓): 음수 위치라 컨테이너 overflow-hidden에
          일부 잘림. Figma상 "카드 안에 담겨" 보이고, 미허용 시 이웃 카드로 삐져나오는
          것이 명백한 버그라 잘림(=담김) 쪽을 잠정 채택. TODO(확인 필요) 확정 후 조정. */}
      <img
        src={hero.illustration}
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-[-11px] right-[-95px] h-[234px] w-[232px] object-contain"
      />

      <div className="relative z-10 flex flex-col gap-3">
        {/* 인사 2행 — weight가 달라 반드시 행 분리(spec §7). 28/-0.56px/140%/#FFF 공통,
            1행 SemiBold(600) · 2행 Medium(500) (spec §2 ✅). */}
        <h2 className="text-white">
          <span className="block font-pretendard text-[28px] font-semibold leading-[140%] tracking-[-0.56px]">
            {name ?? '회원'} 님,
          </span>
          <span className="block font-pretendard text-[28px] font-medium leading-[140%] tracking-[-0.56px]">
            오늘도 잘하고 있어요
          </span>
        </h2>
        {/* 직무 배지 — p8/14, gap4, pill(radius 100px), bg white/10, blur 2px (spec §3 ✅).
            텍스트 14/500/150%/-0.28px는 SubBody 추정(spec §3 ⚠️·§6.2). */}
        <span className="inline-flex items-center gap-1 self-start rounded-full bg-white/10 px-[14px] py-2 font-pretendard text-[14px] font-medium leading-[150%] tracking-[-0.28px] text-white backdrop-blur-[2px]">
          {hero.tag}
        </span>
      </div>

      {/* 이력서 관리 버튼 — p 10/28/10/24(좌우 비대칭), gap10, radius16, bg white/10 (spec §4 ✅).
          아이콘: spec은 mingcute:pencil-fill 24×24 #FFF. 프로젝트에 아이콘 라이브러리가
          없어 형제 카드와 동일한 public 에셋 방식으로 edit-icon.png 사용.
          TODO(확인 필요): mingcute:pencil-fill 도입 여부 및 아이콘 흰색 여부. */}
      <button
        type="button"
        onClick={() => navigate('/resumes')}
        className="relative z-10 inline-flex items-center gap-2.5 self-start rounded-2xl bg-white/10 py-2.5 pl-6 pr-7 font-pretendard text-[14px] font-medium leading-[150%] tracking-[-0.28px] text-white transition hover:bg-white/20"
      >
        <img src="/edit-icon.png" alt="" aria-hidden className="h-6 w-6" />
        이력서 관리
      </button>
    </div>
  );
}
