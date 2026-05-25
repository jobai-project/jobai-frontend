import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function WelcomeCard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const userName = user?.name ?? '게스트';
  const jobRole = user?.jobRole ?? '구직자';

  return (
    <div className="flex h-full justify-between gap-3 rounded-xl border border-app-border bg-gradient-to-br from-blue-50 to-white px-5 py-4">
      <div className="flex min-w-0 flex-col">
        <h2 className="text-lg font-bold text-app-text">
          {userName} 님 안녕하세요 👋
        </h2>
        <div className="mt-1.5">
          <span className="inline-block rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-medium text-app-text-muted">
            {jobRole}
          </span>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <button
            type="button"
            onClick={() => navigate('/resumes')}
            className="rounded-lg border border-app-border bg-white px-3 py-1.5 text-xs font-semibold text-app-text transition hover:border-app-border-strong hover:bg-app-hover"
          >
            ✏️ 이력서 관리
          </button>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="rounded-lg border border-app-border bg-white px-3 py-1.5 text-xs font-semibold text-app-text transition hover:border-app-border-strong hover:bg-app-hover"
          >
            ⚙️ 회원정보 수정
          </button>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="hidden h-20 w-20 flex-shrink-0 self-center rounded-2xl bg-gradient-to-br from-blue-200/70 to-blue-100/40 sm:flex sm:items-center sm:justify-center text-3xl"
      >
        🧑‍💻
      </div>
    </div>
  );
}
