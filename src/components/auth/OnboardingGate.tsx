import { Navigate, Outlet } from 'react-router-dom';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function OnboardingGate() {
  const onboarded = useOnboardingStore((s) => s.onboarded);
  if (!onboarded) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}
