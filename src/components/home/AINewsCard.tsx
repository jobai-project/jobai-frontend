import type { AINewsItem } from '@/data/mockNews';

interface AINewsCardProps {
  news: AINewsItem[];
}

export default function AINewsCard({ news }: AINewsCardProps) {
  return (
    <div className="relative flex h-[306px] w-[256px] flex-shrink-0 flex-col rounded-xl border border-app-border bg-gradient-to-br from-blue-50 to-white px-5 py-4">
      {/* 사진 추가해야함 (디자인팀 일러스트 대기) */}
      <div
        aria-hidden="true"
        className="absolute right-3 top-3 h-10 w-10 rounded-full border border-dashed border-app-border bg-white/40"
      />
      <div className="mb-3 text-sm font-semibold text-app-text">
        ✨ AI 뉴스 요약
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
