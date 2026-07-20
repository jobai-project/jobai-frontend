import { useSearchParams } from 'react-router-dom';
import { useTechCards, toTechGlanceRows } from '@/hooks/useTechCards';

// "오늘 새로 올라온 공고가 12건 있어요" → "12건"만 파랑. 매치 없으면 원문 그대로.
// 뉴스 행 등 "\d+건" 없는 headline 은 분할해도 원문 그대로 렌더되어 영향 없음.
function renderHeadlineWithHighlight(text: string) {
  return text.split(/(\d+건)/).map((part, i) =>
    /^\d+건$/.test(part)
      ? <span key={i} className="text-[#4741FF]">{part}</span>
      : part
  );
}

// 우측 chevron (size-24). rotate-180 은 사용처에서 부여.
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
    </svg>
  );
}

// 로그인 홈 "IT 한눈에" — GET /api/v1/home/tech-cards 를 badge 순서로 3줄 표시.
// 데이터 계층(useTechCards/정규화)은 완성본 재사용, 여기선 UI 연결만 담당.
export default function AINewsCard() {
  const { data, isLoading, isError } = useTechCards();
  const rows = toTechGlanceRows(data?.cards ?? []);
  const [, setSearchParams] = useSearchParams();

  // 신규 공고 행 클릭 → 리스트 뷰 진입(?view=new). q 우선 규칙상 진입 시 q 제거.
  const goNewJobs = () =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('view', 'new');
      next.delete('q');
      return next;
    });

  return (
    // 카드 컨테이너 — height 306 / w-302 / padding 20 / gap 20 / radius 16 + shadow-homecard + bg-card-radial.
    <div className="relative flex h-[306px] w-[302px] flex-col gap-5 rounded-2xl border border-app-primary-soft bg-card-radial p-5 shadow-homecard">
      {/* 헤더 — news아이콘24 + 타이틀 18 SemiBold/-0.36px/black, gap-12. 헤더 chevron 없음. */}
      <div className="flex items-center gap-3">
        <img src="/iconamoon_news-fill.svg" alt="" className="h-6 w-6 flex-shrink-0" />
        <div className="text-[18px] font-semibold leading-[150%] tracking-[-0.36px] text-black">
          IT 한눈에
        </div>
      </div>

      {isLoading ? (
        // 스켈레톤 3줄
        <ul className="flex flex-col">
          {Array.from({ length: 3 }).map((_, i) => (
            <li
              key={i}
              className={i < 2 ? 'border-b-[0.7px] border-gray-200' : ''}
            >
              <div className="flex w-full flex-col gap-2 px-1 py-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
              </div>
            </li>
          ))}
        </ul>
      ) : isError ? (
        <div className="px-1 py-3 text-sm text-gray-500">
          정보를 불러오지 못했어요
        </div>
      ) : (
        <ul className="flex flex-col">
          {rows.map((row, i) => {
            const isLast = i === rows.length - 1;
            const borderClass = isLast ? '' : 'border-b-[0.7px] border-gray-200';

            // 신규 공고 행 — 배지 + 헤드라인("N건" 강조), subtext 미표시(Figma 정본).
            // 클릭 시 relatedJobs 리스트 뷰(?view=new)로 이동. 화살표 우측 상단.
            if (row.badge === '신규 공고') {
              return (
                <li key={`${row.badge}-${i}`} className={borderClass}>
                  <button
                    type="button"
                    onClick={goNewJobs}
                    className="flex w-full items-start justify-between gap-1 px-1 py-3 text-left"
                  >
                    <div className="flex min-w-0 flex-col items-start gap-2">
                      <span className="rounded-[6px] bg-purple-50 px-2 py-1 text-[11px] font-medium leading-[1.3] tracking-[-0.22px] text-blue-500">
                        {row.badge}
                      </span>
                      <div className="text-[14px] font-medium leading-[150%] tracking-[-0.28px] text-gray-900">
                        {renderHeadlineWithHighlight(row.title)}
                      </div>
                    </div>
                    <ChevronIcon className="h-6 w-6 flex-shrink-0 text-gray-500" />
                  </button>
                </li>
              );
            }

            // 항목 내용 (제목/서브 + chevron). 테크 뉴스 줄만 originalUrl 새 탭 링크.
            const inner = (
              <div className="flex w-full items-center justify-between gap-1 px-1 py-3">
                <div className="flex min-w-0 flex-col gap-2">
                  {/* 항목 제목 — 14 Medium/-0.28px/black */}
                  <div className="truncate text-sm font-medium leading-[150%] tracking-[-0.28px] text-black">
                    {renderHeadlineWithHighlight(row.title)}
                  </div>
                  {/* 항목 서브 — 12 Regular/-0.24px/gray-600 */}
                  <div className="truncate text-xs font-normal leading-[150%] tracking-[-0.24px] text-gray-600">
                    {row.sub}
                  </div>
                </div>
                {/* 항목 chevron 24 rotate-180 */}
                <ChevronIcon className="h-6 w-6 flex-shrink-0 text-app-text-subtle" />
              </div>
            );
            return (
              <li
                key={`${row.badge}-${i}`}
                className={i < rows.length - 1 ? 'border-b-[0.7px] border-gray-200' : ''}
              >
                {row.url ? (
                  <a href={row.url} target="_blank" rel="noopener noreferrer" className="block">
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
