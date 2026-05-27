import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const NAV: NavItem[] = [
  { to: '/', label: '홈', icon: '⌂' },
  { to: '/application', label: '지원 현황', icon: '▤' },
  { to: '/scrap', label: '스크랩', icon: '♡' },
  { to: '/profile', label: '프로필', icon: '○' },
];

export default function Sidebar() {
  return (
    <aside className="sticky top-0 h-screen w-60 border-r border-app-border bg-app-surface px-8 py-10">
      <NavLink to="/" className="block pb-9 text-[22px] font-bold tracking-tight">
        JobA!
      </NavLink>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              'flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm transition-colors ' +
              (isActive
                ? 'bg-app-active font-semibold text-app-text'
                : 'text-app-text-muted hover:bg-app-hover hover:text-app-text')
            }
          >
            <span className="w-[18px] text-center text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* 사진 추가해야함 (디자인팀 캐릭터 일러스트 대기) */}
      <div
        aria-hidden="true"
        className="mt-8 h-14 w-14 rounded-2xl border border-dashed border-app-border bg-white/40"
      />
    </aside>
  );
}
