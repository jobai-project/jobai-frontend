import { NavLink } from 'react-router-dom';
import { handleLogout } from '@/api/auth';

interface NavItem {
  to: string;
  label: string;
  icon: () => JSX.Element;
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M4 10.75c0-.67.33-1.3.88-1.69l5.9-4.21a2.08 2.08 0 0 1 2.44 0l5.9 4.21c.55.39.88 1.02.88 1.69V19a2 2 0 0 1-2 2h-3.25a1 1 0 0 1-1-1v-4.25h-3.5V20a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2v-8.25Z"
      />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M6 3h8.2c.27 0 .52.11.71.29l3.8 3.8c.18.19.29.44.29.71V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm8 1.75V8h3.25L14 4.75ZM8 12a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H8Zm0 4a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2H8Z"
      />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M6 4.75C6 3.78 6.78 3 7.75 3h8.5C17.22 3 18 3.78 18 4.75V20a1 1 0 0 1-1.55.83L12 17.86l-4.45 2.97A1 1 0 0 1 6 20V4.75Z"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.42 0-8 2.46-8 5.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5c0-3.04-3.58-5.5-8-5.5Z"
      />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-.08 13.5a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 6.25c2 0 3.5 1.21 3.5 2.95 0 1.32-.78 2.05-1.83 2.8-.76.54-.92.86-.92 1.5v.25a.75.75 0 0 1-1.5 0v-.34c0-1.33.66-1.94 1.54-2.56.86-.61 1.21-.94 1.21-1.65 0-.85-.78-1.45-1.96-1.45-1.03 0-1.76.44-2.13 1.29a.75.75 0 1 1-1.38-.58C9.14 7.05 10.39 6.25 12 6.25Z"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M5 4.75C5 3.78 5.78 3 6.75 3H12a1 1 0 1 1 0 2H7v14h5a1 1 0 1 1 0 2H6.75A1.75 1.75 0 0 1 5 19.25V4.75Zm11.47 3.03a.75.75 0 0 1 1.06 0l3.69 3.69a.75.75 0 0 1 0 1.06l-3.69 3.69a.75.75 0 1 1-1.06-1.06l2.41-2.41H11a.75.75 0 0 1 0-1.5h7.88l-2.41-2.41a.75.75 0 0 1 0-1.06Z"
      />
    </svg>
  );
}

const NAV: NavItem[] = [
  { to: '/', label: '홈', icon: HomeIcon },
  { to: '/application', label: '지원 현황', icon: DocumentIcon },
  { to: '/scrap', label: '스크랩', icon: BookmarkIcon },
  { to: '/profile', label: '마이페이지', icon: UserIcon },
];

export default function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-[276px] flex-col border-r border-app-border bg-app-surface px-[32px] py-[40px]">
      <NavLink to="/" className="block text-[22px] font-bold text-app-sidebar-logo">
        JobA!
      </NavLink>
      <nav className="mt-24 flex flex-col gap-4">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              'group flex h-12 w-full items-center gap-5 rounded-lg px-3 py-3 text-left text-sm transition-colors ' +
              (isActive
                ? 'bg-app-sidebar-active font-semibold text-app-sidebar-active-text'
                : 'text-app-sidebar-muted hover:bg-app-hover hover:text-app-text')
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={
                    'flex h-5 w-5 items-center justify-center transition-colors ' +
                    (isActive
                      ? 'text-app-sidebar-active-text'
                      : 'text-app-sidebar-icon-muted group-hover:text-app-text')
                  }
                >
                  {item.icon()}
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-5 pb-2">
        <button
          type="button"
          className="flex h-10 items-center gap-5 px-5 text-left text-sm font-medium text-app-sidebar-muted hover:text-app-text"
        >
          <span className="flex h-5 w-5 items-center justify-center text-app-sidebar-icon-muted">
            <HelpIcon />
          </span>
          도움말
        </button>
        <button
          type="button"
          onClick={() => {
            void handleLogout();
          }}
          className="flex h-10 items-center gap-5 px-5 text-left text-sm font-medium text-app-sidebar-muted hover:text-app-text"
        >
          <span className="flex h-5 w-5 items-center justify-center text-app-sidebar-icon-muted">
            <LogoutIcon />
          </span>
          로그아웃
        </button>
      </div>
    </aside>
  );
}
