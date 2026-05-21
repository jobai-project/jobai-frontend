import { useNavigate } from 'react-router-dom';

interface SummaryCardProps {
  title: string;
  items: string[];
  to: string;
}

export default function SummaryCard({ title, items, to }: SummaryCardProps) {
  const navigate = useNavigate();
  const goDetail = () => navigate(to);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goDetail}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goDetail();
        }
      }}
      className="cursor-pointer rounded-xl border border-app-border bg-app-surface px-5 py-4 transition hover:-translate-y-0.5 hover:border-app-border-strong focus:outline-none focus:ring-2 focus:ring-app-border-strong"
    >
      <div className="mb-3.5 flex items-center justify-between">
        <div className="text-sm font-semibold text-app-text">{title}</div>
        <span
          aria-hidden="true"
          className="rounded-md px-2 py-1 text-lg text-app-text-subtle transition-colors hover:bg-app-hover hover:text-app-text"
        >
          ›
        </span>
      </div>
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2 py-1 text-[13px] text-app-text-muted"
        >
          <span className="h-1 w-1 flex-shrink-0 rounded-full bg-app-text-subtle" />
          {item}
        </div>
      ))}
    </div>
  );
}
