import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export default function TopBar() {
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
      {/* 테두리·배경은 컨테이너가, input은 투명하게 안에서 늘어남. 아이콘은 오른쪽. */}
      <div className="flex h-12 w-full max-w-[716px] items-center gap-2 rounded-[10px] border border-app-border bg-app-surface px-6">
        <input
          type="text"
          value={q}
          onChange={handleSearchChange}
          placeholder="공고명, 회사명, 기술 스택으로 검색해 보세요"
          className="flex-1 bg-transparent text-sm text-app-text outline-none placeholder:text-app-text-subtle"
        />
        <img src="/A22.svg" alt="검색" className="h-5 w-5 shrink-0" />
      </div>
    </div>
  );
}
