import { NavLink, useNavigate } from 'react-router-dom';
import { handleLogout } from '@/api/auth';

interface NavItem {
  to: string;
  label: string;
  icon: () => JSX.Element;
  // 보호 탭 여부 — 게스트가 클릭하면 /login으로 유도 (spec §3). 홈(/)만 비보호.
  protected?: boolean;
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path
        fill="currentColor"
        d="M4 10.75c0-.67.33-1.3.88-1.69l5.9-4.21a2.08 2.08 0 0 1 2.44 0l5.9 4.21c.55.39.88 1.02.88 1.69V19a2 2 0 0 1-2 2h-3.25a1 1 0 0 1-1-1v-4.25h-3.5V20a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2v-8.25Z"
      />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path
        fill="currentColor"
        d="M6 3h8.2c.27 0 .52.11.71.29l3.8 3.8c.18.19.29.44.29.71V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm8 1.75V8h3.25L14 4.75ZM8 12a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H8Zm0 4a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2H8Z"
      />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path
        fill="currentColor"
        d="M6 4.75C6 3.78 6.78 3 7.75 3h8.5C17.22 3 18 3.78 18 4.75V20a1 1 0 0 1-1.55.83L12 17.86l-4.45 2.97A1 1 0 0 1 6 20V4.75Z"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path
        fill="currentColor"
        d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.42 0-8 2.46-8 5.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5c0-3.04-3.58-5.5-8-5.5Z"
      />
    </svg>
  );
}

// 사이드바 토글 아이콘 (§Phase2 1-5, size-24). 접기 기능은 후속 — 지금은 아이콘 배치만.
function SidebarToggleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 5.5h16M4 5.5v13h16v-13M9.5 5.5v13"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path
        fill="currentColor"
        d="M5 4.75C5 3.78 5.78 3 6.75 3H12a1 1 0 1 1 0 2H7v14h5a1 1 0 1 1 0 2H6.75A1.75 1.75 0 0 1 5 19.25V4.75Zm11.47 3.03a.75.75 0 0 1 1.06 0l3.69 3.69a.75.75 0 0 1 0 1.06l-3.69 3.69a.75.75 0 1 1-1.06-1.06l2.41-2.41H11a.75.75 0 0 1 0-1.5h7.88l-2.41-2.41a.75.75 0 0 1 0-1.06Z"
      />
    </svg>
  );
}

const NAV: NavItem[] = [
  { to: '/', label: '홈', icon: HomeIcon },
  { to: '/application', label: '지원 현황', icon: DocumentIcon, protected: true },
  { to: '/scrap', label: '스크랩', icon: BookmarkIcon, protected: true },
  { to: '/profile', label: '마이페이지', icon: UserIcon, protected: true },
];

// NavLink/버튼 공용 클래스 — 활성/비활성 스타일을 한 곳에서 관리.
// 공용 탭 규격 (round2 §3 실측): w 212(컨테이너 212=276-32×2), padding 12, gap 16,
// align center, radius 8, height 48(24+12+12). 회원·게스트·로그인/로그아웃 공통(중복 정의 금지).
// 1-7 radius: rounded-lg(config=16px 오버라이드) → rounded-base(8px)로 사용처만 교체(결정 ③).
// 1-8 텍스트: 16px Medium tracking -0.32px (색은 활성/비활성 유지).
const ITEM_BASE =
  'group flex h-12 w-full items-center gap-4 rounded-base px-3 py-3 text-left text-[16px] font-medium tracking-[-0.32px] transition-colors ';
const ITEM_ACTIVE = 'bg-app-sidebar-active font-semibold text-app-sidebar-active-text';
const ITEM_INACTIVE = 'text-app-sidebar-muted hover:bg-app-hover hover:text-app-text';
const ICON_BASE = 'flex h-6 w-6 items-center justify-center transition-colors ';
const ICON_ACTIVE = 'text-app-sidebar-active-text';
const ICON_INACTIVE = 'text-app-sidebar-icon-muted group-hover:text-app-text';

interface SidebarProps {
  guest?: boolean;
}

export default function Sidebar({ guest = false }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <aside className="sticky top-0 flex h-screen w-[276px] flex-col gap-[88px] border-r border-gray-200 bg-app-surface px-[32px] py-[40px]">
      {/* 1-3 로고 행: 로고(좌) + 토글 아이콘(우) */}
      <div className="flex items-center justify-between">
        {/* 1-4 로고: public/logo.png. w-[86px] 실측 폭 고정 + h-auto(3.48:1 왜곡 방지).
            h-[48px]는 슬롯 높이(기존 text 라인박스 32×1.5=48 승계 — 빼면 행 높이 붕괴). */}
        <NavLink to="/" className="flex h-[48px] items-center">
          <img src="/logo.png" alt="JobA!" className="h-auto w-[86px]" />
        </NavLink>
        {/* 1-5 토글 아이콘 */}
        <button
          type="button"
          aria-label="사이드바 접기"
          className="flex h-6 w-6 items-center justify-center text-app-sidebar-icon-muted transition-colors hover:text-app-text"
        >
          <SidebarToggleIcon />
        </button>
      </div>
      {/* 1-6 Nav: flex-1 + justify-between (상단 그룹 gap-8 ·· 하단 로그인/로그아웃) */}
      <nav className="flex flex-1 flex-col justify-between">
      <div className="flex flex-col gap-2">
        {NAV.map((item) => {
          // 게스트 + 보호 탭 → NavLink 대신 버튼으로 /login 유도 (spec §3).
          if (guest && item.protected) {
            return (
              <button
                key={item.to}
                type="button"
                onClick={() => navigate('/login')}
                className={ITEM_BASE + ITEM_INACTIVE}
              >
                <span className={ICON_BASE + ICON_INACTIVE}>{item.icon()}</span>
                {item.label}
              </button>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                ITEM_BASE + (isActive ? ITEM_ACTIVE : ITEM_INACTIVE)
              }
            >
              {({ isActive }) => (
                <>
                  <span className={ICON_BASE + (isActive ? ICON_ACTIVE : ICON_INACTIVE)}>
                    {item.icon()}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      <div className="flex flex-col pb-2">
        {/* 게스트: 좌하단 '로그인'(→/login). 회원: '로그아웃'. 공용 탭 규격 재사용(round2 §3). */}
        {guest ? (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className={ITEM_BASE + ITEM_INACTIVE}
          >
            <span className={ICON_BASE + ICON_INACTIVE}>
              <LogoutIcon />
            </span>
            로그인
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              void handleLogout();
            }}
            className={ITEM_BASE + ITEM_INACTIVE}
          >
            <span className={ICON_BASE + ICON_INACTIVE}>
              <LogoutIcon />
            </span>
            로그아웃
          </button>
        )}
      </div>
      </nav>
    </aside>
  );
}
