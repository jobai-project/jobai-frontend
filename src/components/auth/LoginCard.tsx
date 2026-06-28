import { useState } from 'react';
import { startGoogleLogin } from '@/api/auth';

interface LoginCardProps {
  onClose?: () => void; // 모달일 때만 전달 → 우상단 × 노출
}

// Figma Frame 2147225622. 카드 본체(모달/페이지 공용).
// §1 외곽값은 Dev Mode 확정. §3 내부 요소(타이포/색/간격)는 추정값이라 디자이너
// 확정 시 교체 — 일단 프로젝트 토큰(app-*) + Pretendard로 매핑한다.
// (backdrop blur 적용 여부 미확정 §0-2 → 온보딩 카드와 동일하게 blur 미적용 유지.)
export default function LoginCard({ onClose }: LoginCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // 연동 로직은 feature-auth-google-login.md 3-3 재사용(@/api/auth).
  const handleGoogleLogin = async () => {
    setError(false);
    setLoading(true);
    try {
      // 성공 시 외부(구글)로 전체 이동하므로 이 컴포넌트는 언마운트된다.
      await startGoogleLogin();
    } catch {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="relative flex w-[555px] max-w-full flex-col items-start gap-10 rounded-2xl bg-white/50 p-10 shadow-[0_0_24px_0_rgba(51,68,255,0.12)]">
      {/* × 닫기 (모달 전용) — §3 추정: ≈20px / text-subtle */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-10 top-10 text-xl leading-none text-app-text-subtle hover:text-app-text"
        >
          ✕
        </button>
      )}

      {/* ① 텍스트 블록 (§3 추정: title H2 26px Bold / sub 14px muted / gap 8) */}
      <div className="flex flex-col items-start gap-2">
        <h2 className="font-pretendard text-[26px] font-bold text-app-text">로그인</h2>
        <p className="font-pretendard text-sm text-app-text-muted">
          Joba!가 처음이라면 회원가입을 진행해주세요.
        </p>
      </div>

      {/* ② Google 버튼 — 폭은 stretch(w-full), 콘텐츠 중앙. (§3 추정: h≈54 / border / radius 8) */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 self-stretch rounded-lg border border-app-border bg-white py-3.5 font-pretendard text-base font-medium text-app-text hover:bg-app-hover disabled:opacity-50"
      >
        <img src="/google.svg" alt="" aria-hidden className="h-5 w-5" />
        {loading ? '이동 중...' : 'Google로 로그인'}
      </button>

      {error && (
        <p className="self-stretch text-center text-xs text-red-500">
          로그인을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      )}
    </div>
  );
}
