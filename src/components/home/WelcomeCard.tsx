import { useNavigate } from 'react-router-dom';
import userCardBg from '@/picture/User_card.png';

export default function WelcomeCard() {
  const navigate = useNavigate();

  // 수정 할 부분 : API 연결해야할 부분
  const userName = '김주훈';
  const jobRole = '백엔드 개발자';

  return (
    <div
      className="relative flex h-[306px] w-[440px] flex-shrink-0 flex-col justify-between overflow-hidden rounded-[20px] p-10"
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
          {userName} 님,
          <br />
          오늘도 잘하고 있어요
        </h2>
        <div>
          <span className="inline-block rounded-full bg-white/20 px-3.5 py-1.5 text-[13px] font-medium text-white backdrop-blur-md">
            {jobRole}
          </span>
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
