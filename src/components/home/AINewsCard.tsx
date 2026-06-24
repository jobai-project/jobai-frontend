import type { AINewsItem } from '@/data/mockNews';
import newsIcon from '/iconamoon_news-fill.svg';

interface AINewsCardProps {
  news: AINewsItem[];
}

export default function AINewsCard({ news }: AINewsCardProps) {
  return (
    <div className="relative flex h-[306px] w-[256px] flex-shrink-0 flex-col rounded-xl border border-app-primary-soft bg-card-gradient px-5 py-4 shadow-[0_10px_28px_rgba(71,65,255,0.14)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-app-text">
          <img src={newsIcon} alt="" className="h-6 w-6 flex-shrink-0" />
          IT 한눈에
        </div>
        <span aria-hidden="true" className="text-lg text-app-text-subtle">
          ›
        </span>
      </div>
      <ul className="flex flex-col gap-2.5">
        {news.map((item, i) => (
          <li key={i} className="flex flex-col gap-0.5">
            <div className="truncate text-[13px] font-bold text-app-text">
              {item.title}
            </div>
            <div className="flex items-start gap-1.5 text-xs text-app-text-muted">
              <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-app-text-subtle" />
              <span className="line-clamp-2">{item.summary}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
