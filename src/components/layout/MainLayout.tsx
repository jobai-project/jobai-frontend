import { Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  // 게스트(비로그인) 모드 — Sidebar에 전달해 보호 탭을 /login으로 유도 (spec §2·§3).
  guest?: boolean;
  // children으로 감싸 쓰면 그걸, 아니면 레이아웃 라우트로서 <Outlet/>을 렌더 (spec §1 적응 포인트).
  children?: ReactNode;
}

export default function MainLayout({ guest = false, children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen justify-center">
      <div className="grid min-h-screen w-[1440px] grid-cols-[276px_1fr] bg-app-bg">
        <Sidebar guest={guest} />
        <main className="p-[40px]">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
