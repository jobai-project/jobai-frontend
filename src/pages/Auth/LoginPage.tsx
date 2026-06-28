import { Navigate } from 'react-router-dom';
import LoginCard from '@/components/auth/LoginCard';
import { useAuthStore } from '@/stores/authStore';

// 페이지 wrapper(§4-2-B). onClose 미전달 → × 미표시. 화면 중앙 정렬.
export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-bg text-app-text-muted">
        로딩 중...
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-4">
      <LoginCard />
    </div>
  );
}
