import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import JobDetailPage from './pages/JobDetailPage';
import PlaceholderPage from './pages/PlaceholderPage';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />

        {/* // 추가해야함 라우트 */}
        <Route
          path="/application"
          element={<PlaceholderPage icon="▤" title="지원 현황" />}
        />
        <Route path="/scrap" element={<PlaceholderPage icon="♡" title="스크랩" />} />
        <Route path="/profile" element={<PlaceholderPage icon="○" title="프로필" />} />
        <Route
          path="/deadline"
          element={<PlaceholderPage icon="📌" title="스크랩 마감일자" />}
        />
        <Route
          path="/ranking"
          element={<PlaceholderPage icon="🏆" title="스크랩 순위" />}
        />
        <Route
          path="/insight"
          element={<PlaceholderPage icon="📊" title="시장 인사이트" />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
