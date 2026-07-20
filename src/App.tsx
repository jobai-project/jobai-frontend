import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomeEntry from './pages/HomeEntry';
import JobDetailPage from './pages/JobDetailPage';
import ScrapPage from '@/pages/ScrapPage';
import ApplicationStatusPage from '@/pages/ApplicationStatusPage';
import MyPage from '@/pages/MyPage';
import OnboardingPage from '@/pages/Onboarding/OnboardingPage';
import LoginPage from '@/pages/Auth/LoginPage';
import OAuthCallback from '@/pages/Auth/OAuthCallback';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { getMe } from '@/api/auth';
import BookmarkToast from '@/components/common/BookmarkToast';
import MatchNotificationListener from '@/components/common/MatchNotificationListener';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import OnboardingGate from '@/components/auth/OnboardingGate';

export default function App() {
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);
  const setOnboarded = useOnboardingStore((s) => s.setOnboarded);
  const resetOnboarding = useOnboardingStore((s) => s.reset);

  // 앱 진입 시 세션 복구: 쿠키가 남아 있으면 /auth/me 한 번으로 자동 로그인 복구.
  // 온보딩 완료 여부가 user.onboarded로 오면 서버 값을 우선한다.
  useEffect(() => {
    getMe()
      .then((user) => {
        setUser(user);
        if (typeof user.onboarded === 'boolean') setOnboarded(user.onboarded);
      })
      .catch(() => {
        clearUser();
        resetOnboarding();
      });
  }, [setUser, clearUser, setOnboarded, resetOnboarding]);

  return (
    <>
      <Routes>
        {/* 인증 화면은 사이드바/탑바 없는 전체화면 — MainLayout 밖. 보호하지 않는다. */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/oauth2/redirect" element={<OAuthCallback />} />
        {/* 개인정보 처리방침 — 사이드바 없는 독립 전체화면. 비로그인 접근 허용(ProtectedRoute 밖). */}
        <Route path="/privacy" element={<PrivacyPolicyPage />} />

        {/* / 는 공개 진입점. 게스트/회원/온보딩 분기는 HomeEntry가 담당 (spec §1). */}
        <Route path="/" element={<HomeEntry />} />

        <Route element={<ProtectedRoute />}>
          {/* 온보딩은 인증만 필요하고, 온보딩 게이트는 적용하지 않는다. */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          <Route element={<OnboardingGate />}>
            <Route element={<MainLayout />}>
              {/* / 는 HomeEntry로 이동됨. 나머지 보호 라우트는 그대로. */}
              <Route path="/jobs/:source/:id" element={<JobDetailPage />} />

              <Route path="/application" element={<ApplicationStatusPage />} />
              <Route path="/scrap" element={<ScrapPage />} />
              <Route path="/profile" element={<MyPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* 전역 토스트/알림 — 레이아웃 바깥에 1회만 마운트해서 라우트 이동과 무관하게
          계속 살아있도록 한다 (MainLayout 안에 있으면 홈↔다른 페이지 이동 시마다
          MainLayout 자체가 언마운트/재마운트되면서 웹소켓 연결이 끊겼다 재연결됨). */}
      <BookmarkToast />
      <MatchNotificationListener />
    </>
  );
}