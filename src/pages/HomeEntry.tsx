import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import MainLayout from '@/components/layout/MainLayout';
import HomePage from './HomePage';
import GuestHome from './GuestHome';

// ProtectedRoute의 "로딩 중..." 블록과 동일 UX로 통일 (spec §1).
function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center text-app-text-muted">
      로딩 중...
    </div>
  );
}

// '/'의 게스트/회원/온보딩 분기를 한 곳에 모은다 (spec §1).
export default function HomeEntry() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const onboarded = useOnboardingStore((s) => s.onboarded);

  // 1) /auth/me 세션 복구 대기 (authStore: isLoading 초기 true)
  if (isLoading) return <LoadingScreen />;

  // 2) 게스트 → 공유 레이아웃(게스트 모드) + GuestHome
  if (!isAuthenticated) {
    return (
      <MainLayout guest>
        <GuestHome />
      </MainLayout>
    );
  }

  // 3) 회원 + 미온보딩 → 온보딩 (기존 OnboardingGate와 동일 목적지)
  if (!onboarded) return <Navigate to="/onboarding" replace />;

  // 4) 회원 + 온보딩 완료 → 기존 회원 홈
  return (
    <MainLayout>
      <HomePage />
    </MainLayout>
  );
}
