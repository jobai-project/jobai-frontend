import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen justify-center">
      <div className="grid min-h-screen w-[1440px] grid-cols-[276px_1fr] bg-app-bg">
        <Sidebar />
        <main className="p-[40px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
