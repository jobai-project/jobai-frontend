import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';

// 구글 로그인 콜백 착지 페이지. 쿠키가 심긴 상태로 /auth/me를 호출해 세션을 확정한다.
// ⚠️ ProtectedRoute로 감싸지 말 것 (진입 시 미인증 → 무한 리다이렉트).
// TODO(백엔드 연동 필요): 이 라우트 경로(/oauth/callback)는 BE가 로그인 후
// 리다이렉트하는 착지 URL과 일치해야 함. 미정 시 App.tsx의 세션 복구(3-5)로 대체 가능.
export default function OAuthCallback() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);
  const setOnboarded = useOnboardingStore((s) => s.setOnboarded);
  const resetOnboarding = useOnboardingStore((s) => s.reset);

  useEffect(() => {
    (async () => {
      try {
        const user = await getMe();
        setUser(user); // { email, name }
        if (typeof user.onboarded === 'boolean') setOnboarded(user.onboarded);

        // 로그인 안 된 상태로 보호된 경로에 들어왔다가 여기로 리다이렉트된 거라면,
        // ProtectedRoute가 sessionStorage에 저장해둔 원래 경로로 돌려보낸다.
        const redirectTo = sessionStorage.getItem('postLoginRedirect');
        sessionStorage.removeItem('postLoginRedirect');
        navigate(redirectTo ?? '/', { replace: true });
      } catch {
        clearUser();
        resetOnboarding();
        navigate('/login', { replace: true });
      }
    })();
  }, [navigate, setUser, clearUser, setOnboarded, resetOnboarding]);

  return (
    <div className="flex min-h-screen items-center justify-center text-app-text-muted">
      로그인 처리 중...
    </div>
  );
}