import { useNavigate } from 'react-router-dom';
import { useConditionStore } from '@/stores/conditionStore';
import { useAuthStore } from '@/stores/authStore';
import userCardBg from '/User_card.png';

// 역할별 히어로 변형 (spec §1.2). 이미지는 public/ 한글 파일명 → 절대경로 참조.
// ⚠️ 태그 텍스트가 역할 고정 라벨인지 사용자 직무 데이터인지 미확정 (spec §8.6):
// 일단 역할별 고정 라벨로 구현. TODO(확인 필요) 확정 후 교체.
type HeroRole = 'developer' | 'designer' | 'planner';
const ROLE_HERO: Record<HeroRole, { illustration: string; tag: string }> = {
  developer: { illustration: '/개발자홈화면.png', tag: '백엔드 개발자' },
  designer: { illustration: '/디자이너홈화면.png', tag: '프로덕트 디자이너' },
  planner: { illustration: '/기획자홈화면.png', tag: '서비스 기획자' },
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
    // ⚠️ 이미지 범위 미확정(spec §8.5): *홈화면.png 를 "우측 일러스트"로 가정하고
    // 카드 배경(User_card.png) 위에 오버레이. 카드 전체 배경이면 Figma 확인 후 교체.
    <div
      className="relative flex h-[306px] flex-col justify-between overflow-hidden rounded-[20px] p-10"
      style={{
        backgroundImage: `url(${userCardBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        boxShadow: '0 8px 24px rgba(99, 70, 220, 0.15)',
      }}
    >
      {/* 우측 3D 일러스트 (역할별) */}
      <img
        src={hero.illustration}
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-4 h-[240px] w-auto object-contain"
      />

      <div className="relative z-10 flex flex-col gap-3">
        <h2 className="text-[24px] font-bold leading-[1.4] text-white">
          {name ?? '회원'} 님, 오늘도 잘하고 있어요
        </h2>
        <span className="inline-block self-start rounded-full bg-white/20 px-3.5 py-1.5 text-[13px] font-medium text-white backdrop-blur-md">
          {hero.tag}
        </span>
      </div>

      <button
        type="button"
        onClick={() => navigate('/resumes')}
        className="relative z-10 inline-flex items-center gap-2 self-start rounded-xl bg-white/25 px-5 py-3 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/35"
      >
        <span aria-hidden="true">✏️</span>
        이력서 관리
      </button>
    </div>
  );
}
