import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen justify-center">
      <div className="grid w-[1440px] min-h-screen grid-cols-[240px_1200px] bg-app-bg">
        <Sidebar />
        <main className="px-9 pb-12 pt-6">
          <TopBar />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
