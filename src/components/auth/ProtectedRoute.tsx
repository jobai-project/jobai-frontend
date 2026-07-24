import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

// 쿠키 세션 복구가 끝나기 전(isLoading)에는 판단을 보류해 깜빡임/오판을 막는다.
// OAuth 착지 페이지는 진입 시 미인증 상태일 수 있으므로 이 게이트로 감싸지 않는다.
export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-app-text-muted">
        로딩 중...
      </div>
    );
  }

  if (!isAuthenticated) {
    // 로그인 안 된 채로 보호된 경로(예: 알림 클릭으로 들어온 /notifications/matches/123)에
    // 진입하면, 로그인 후 원래 여기로 돌아올 수 있도록 sessionStorage에 저장해둔다.
    // (구글 OAuth로 완전히 다른 도메인을 거쳐 돌아오므로 React state로는 못 들고 다님)
    sessionStorage.setItem('postLoginRedirect', location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}