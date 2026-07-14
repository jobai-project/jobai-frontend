import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomeEntry from './pages/HomeEntry';
import JobDetailPage from './pages/JobDetailPage';
import ScrapPage from '@/pages/ScrapPage';
import ApplicationStatusPage from '@/pages/ApplicationStatusPage';
import MyPage from '@/pages/MyPage';
import PlaceholderPage from './pages/PlaceholderPage';
import OnboardingPage from '@/pages/Onboarding/OnboardingPage';
import LoginPage from '@/pages/Auth/LoginPage';
import OAuthCallback from '@/pages/Auth/OAuthCallback';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { getMe } from '@/api/auth';
import BookmarkToast from '@/components/common/BookmarkToast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import OnboardingGate from '@/components/auth/OnboardingGate';

export default function App() {
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);
  const setOnboarded = useOnboardingStore((s) => s.setOnboarded);
  const resetOnboarding = useOnboardingStore((s) => s.reset);

  // const MOCK_AUTH = true; 

  // 앱 진입 시 세션 복구: 쿠키가 남아 있으면 /auth/me 한 번으로 자동 로그인 복구.
  // 온보딩 완료 여부가 user.onboarded로 오면 서버 값을 우선한다.
  useEffect(() => {
    // if (MOCK_AUTH) {
    //   setUser({ email: 'dev@test.com', name: '개발자', onboarded: true });
    //   setOnboarded(true);
    //   return;
    // } 
    
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

        {/* {import.meta.env.DEV && (
          <Route element={<MainLayout />}>
            <Route path="/dev/application" element={<ApplicationStatusPage />} />
            <Route path="/dev/scrap" element={<ScrapPage />} />
            <Route path="/dev/profile" element={<MyPage />} />
          </Route>
        )}         */}

        {/* / 는 공개 진입점. 게스트/회원/온보딩 분기는 HomeEntry가 담당 (spec §1). */}
        <Route path="/" element={<HomeEntry />} />

        <Route element={<ProtectedRoute />}>
          {/* 온보딩은 인증만 필요하고, 온보딩 게이트는 적용하지 않는다. */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          <Route element={<OnboardingGate />}>
            <Route element={<MainLayout />}>
              {/* / 는 HomeEntry로 이동됨. 나머지 보호 라우트는 그대로. */}
              <Route path="/jobs/:id" element={<JobDetailPage />} />

              {/* // 추가해야함 라우트 */}
              <Route path="/application" element={<ApplicationStatusPage />} />
              <Route path="/scrap" element={<ScrapPage />} />
              <Route path="/profile" element={<MyPage />} />
              <Route
                path="/insight"
                element={<PlaceholderPage icon="📊" title="시장 인사이트" />}
              />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* 전역 토스트 — 레이아웃 바깥에 1회만 마운트 */}
      <BookmarkToast />
    </>
  );
}
