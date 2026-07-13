import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  // 기본은 기존 '뒤로 가기' 회색 박스(PlaceholderPage 등 공유 사용처 영향 없음).
  // 'pill' = 공고 상세용(A-3): '목록으로' pill 형태.
  label?: string;
  variant?: 'default' | 'pill';
}

export default function BackButton({
  label = '뒤로 가기',
  variant = 'default',
}: BackButtonProps) {
  const navigate = useNavigate();
  const cls =
    variant === 'pill'
      ? 'inline-flex h-[46px] items-center gap-1.5 rounded-full border border-[#F5F5FF] bg-white px-3.5 text-[18px] text-[#303D4C] transition-colors hover:bg-app-hover'
      : 'inline-flex items-center gap-1.5 rounded-lg border border-app-border bg-app-surface px-3.5 py-2 text-[13px] text-app-text transition-colors hover:border-app-border-strong hover:bg-app-hover';
  return (
    <button type="button" onClick={() => navigate(-1)} className={cls}>
      {/* ❓ TODO: Figma 'C18' 아이콘 미확인(chevron-left 추정) → 확인 전까지 기존 화살표 유지 */}
      ← {label}
    </button>
  );
}
