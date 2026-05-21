import { useNavigate } from 'react-router-dom';

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="absolute left-0 top-0 inline-flex items-center gap-1.5 rounded-lg border border-app-border bg-app-surface px-3.5 py-2 text-[13px] text-app-text transition-colors hover:border-app-border-strong hover:bg-app-hover"
    >
      ← 뒤로 가기
    </button>
  );
}
