import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

interface TopBarProps {
  userName?: string;
}

export default function TopBar({ userName = '사용자이름' }: TopBarProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const q = searchParams.get('q') ?? '';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const next = new URLSearchParams(searchParams);
    if (value) next.set('q', value);
    else next.delete('q');

    const target = { pathname: '/', search: next.toString() };
    const stayingOnHome = location.pathname === '/';
    navigate(target, { replace: stayingOnHome });
  };

  return (
    <div className="mb-8 flex items-center gap-5">
      <div className="relative max-w-[520px] flex-1">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-app-text-subtle">
          ⌕
        </span>
        <input
          type="text"
          value={q}
          onChange={handleSearchChange}
          placeholder="검색어를 입력하세요"
          className="w-full rounded-[10px] border border-app-border bg-app-surface px-4 py-2.5 pl-10 text-sm text-app-text outline-none transition-colors placeholder:text-app-text-subtle focus:border-app-border-strong"
        />
      </div>
      <div className="ml-auto flex items-center gap-3.5">
        <span className="text-sm text-app-text">
          {userName} 님 안녕하세요
          <span className="ml-0.5 inline-block">👋</span>
        </span>
        <button
          type="button"
          className="rounded-lg border border-app-border bg-app-surface px-3.5 py-2 text-[13px] text-app-text transition-colors hover:bg-app-hover"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
