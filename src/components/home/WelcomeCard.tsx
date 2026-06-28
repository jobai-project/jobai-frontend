import { useNavigate } from 'react-router-dom';
import { useConditionStore } from '@/stores/conditionStore';
import userCardBg from '/User_card.png';

export default function WelcomeCard() {
  const navigate = useNavigate();

  // 온보딩에서 고른 관심 직무를 모두 칩으로 표시. 없으면 안내 칩 하나.
  const jobTypes = useConditionStore((s) => s.condition?.jobTypes);
  const roleChips = jobTypes?.length ? jobTypes : ['관심 직무를 설정해보세요'];

  return (
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
      <div className="flex flex-col gap-3">
        <h2 className="text-[24px] font-bold leading-[1.4] text-white">
          오늘도 잘하고 있어요
        </h2>
        <div className="flex flex-wrap gap-2">
          {roleChips.map((role) => (
            <span
              key={role}
              className="inline-block rounded-full bg-white/20 px-3.5 py-1.5 text-[13px] font-medium text-white backdrop-blur-md"
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/resumes')}
        className="inline-flex items-center gap-2 self-start rounded-xl bg-white/25 px-5 py-3 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/35"
      >
        <span aria-hidden="true">✏️</span>
        이력서 관리
      </button>
    </div>
  );
}
