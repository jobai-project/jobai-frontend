import type { AINewsItem } from '@/data/mockNews';
import newsIcon from '/iconamoon_news-fill.svg';

interface AINewsCardProps {
  news: AINewsItem[];
}

export default function AINewsCard({ news }: AINewsCardProps) {
  return (
    // 카드 컨테이너 §3.1: height 306 / padding 20 / gap 20 / radius 16.
    // 폭은 홈 그리드 컬럼이 결정(§5.2 ⚠️: 실측 302px vs 컬럼 폭 일치 여부 확인).
    // ⚠️ align-items:flex-end 는 실측값이나 콘텐츠는 좌측 정렬로 보임(§3.1) → 좌측 유지, 확인 필요.
    // ⚠️ border(blue-100 §8.1)/radial-gradient 배경(§8.2)/box-shadow(§8.3) 잘린 값 → 근사 유지, TODO.
    <div className="relative flex h-[306px] flex-col gap-5 rounded-2xl border border-app-primary-soft bg-card-gradient p-5 shadow-[0_10px_28px_rgba(71,65,255,0.14)]">
      <div className="flex items-center justify-between">
        {/* 섹션 타이틀 — section 토큰 (18/600/150%/-0.36px/gray-900) */}
        <div className="inline-flex items-center gap-2 text-[18px] font-semibold leading-[150%] tracking-[-0.36px] text-gray-900">
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
            {/* 항목 제목 — body-md 토큰 (14/500/150%/-0.28px).
                ⚠️ 색상 #000 (같은 급 다른 제목은 gray-900) — 실측대로 적용, 의도 확인 필요 §8.4 */}
            <div className="truncate text-sm font-medium leading-[150%] tracking-[-0.28px] text-black">
              {item.title}
            </div>
            {/* 항목 설명 — caption-sm 토큰 (12/400/150%/-0.24px/gray-600) */}
            <div className="flex items-start gap-1.5 text-xs font-normal leading-[150%] tracking-[-0.24px] text-gray-600">
              <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-app-text-subtle" />
              <span className="line-clamp-2">{item.summary}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
