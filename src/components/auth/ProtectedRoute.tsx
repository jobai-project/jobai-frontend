import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

// 쿠키 세션 복구가 끝나기 전(isLoading)에는 판단을 보류해 깜빡임/오판을 막는다.
// OAuth 착지 페이지는 진입 시 미인증 상태일 수 있으므로 이 게이트로 감싸지 않는다.
export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-app-text-muted">
        로딩 중...
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
