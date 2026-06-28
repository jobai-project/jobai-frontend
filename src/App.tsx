import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import JobDetailPage from './pages/JobDetailPage';
import ScrapPage from '@/pages/ScrapPage';
import ApplicationStatusPage from '@/pages/ApplicationStatusPage';
import MyPage from '@/pages/MyPage';
import PlaceholderPage from './pages/PlaceholderPage';
import OnboardingPage from '@/pages/Onboarding/OnboardingPage';
import { useOnboardingGate } from '@/hooks/useOnboardingGate';
import BookmarkToast from '@/components/common/BookmarkToast';

export default function App() {
  // 게이트는 라우트 최상단에서 1회 평가한다. (본 화면 내부에 두면 이미 홈이
  // 렌더된 뒤라 리다이렉트 타이밍을 놓친다.)
  const { needsOnboarding } = useOnboardingGate();

  return (
    <>
      <Routes>
        {/* 온보딩은 사이드바/탑바 없는 전체화면 — MainLayout 밖에 둔다. */}
        <Route path="/onboarding" element={<OnboardingPage />} />

        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={
              needsOnboarding ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <HomePage />
              )
            }
          />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* 전역 토스트 — 레이아웃 바깥에 1회만 마운트 */}
      <BookmarkToast />
    </>
  );
}
