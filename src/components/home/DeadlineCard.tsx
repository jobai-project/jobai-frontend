import { useNavigate } from 'react-router-dom';
import timeIcon from '/mingcute_time-fill.svg';
import EmptyScrap from '@/components/common/EmptyScrap';
import { useUpcomingDeadlineScraps, useScraps } from '@/hooks/useScraps';
import { formatDDay } from '@/utils/dDay';

// 우측 chevron (size-24). rotate-180 은 사용처에서 부여.
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
    </svg>
  );
}

export default function DeadlineCard() {
  const navigate = useNavigate();
  // S3: 서버가 정렬·마감필터·최대3 수행. 🔴 프론트 재정렬/재필터/slice 금지(§1.3·§4).
  const { data: upcoming = [], isPending: s3Loading } = useUpcomingDeadlineScraps();
  // S1: E-1(스크랩 0건) vs E-2(스크랩은 있으나 임박 없음) 구분용.
  // queryKey ['scraps','list'] 동일 → BookmarkButton 캐시 공유, 요청 증가 0.
  const { data: scraps = [], isPending: s1Loading } = useScraps();

  // 빈 상태 버튼: 같은 홈 화면의 "딱 맞는 공고" 섹션으로 부드럽게 스크롤
  const handleGoToScrap = () => {
    document
      .getElementById('recommended-jobs')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex h-[306px] w-[302px] flex-col rounded-2xl border border-app-primary-soft bg-card-radial p-5 shadow-homecard">
      <button
        type="button"
        onClick={() => navigate('/scrap')}
        className="mb-3 flex items-center justify-between text-left transition hover:opacity-80"
      >
        <span className="inline-flex items-center gap-3 text-[18px] font-semibold leading-[150%] tracking-[-0.36px] text-gray-900">
          <img src={timeIcon} alt="" className="h-6 w-6 flex-shrink-0" />
          곧 마감되는 스크랩 공고
        </span>
        <ChevronIcon className="h-6 w-6 flex-shrink-0 text-app-text-subtle" />
      </button>

      {/* 🔴 순서 중요: 로딩 → 목록 → E-1(스크랩 0건) → E-2(임박 없음) */}
      {s1Loading || s3Loading ? (
        <div className="flex-1 animate-pulse rounded-xl bg-white/40" />
      ) : upcoming.length > 0 ? (
        <ul className="flex flex-col">
          {upcoming.map((s, index) => (
            <li
              key={s.key}
              className={index < upcoming.length - 1 ? 'border-b-[0.7px] border-gray-200' : ''}
            >
              {/* 상세이동 복구 — S3가 source 를 주므로 /jobs/:source/:id 로 이동 (C3) */}
              <button
                type="button"
                onClick={() => navigate(`/jobs/${s.source}/${s.sourceId}`)}
                className="flex w-full items-start justify-between gap-2 py-3 text-left transition hover:bg-white/50"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="truncate text-base font-medium leading-[150%] tracking-[-0.32px] text-gray-900">
                    {s.title}
                  </div>
                  <div className="truncate text-sm font-normal leading-[150%] tracking-[-0.28px] text-gray-600">
                    {s.companyName}
                  </div>
                </div>
                <div className="flex w-[54px] flex-shrink-0 flex-col items-end gap-1">
                  <span className="text-[14px] font-medium leading-[150%] tracking-[-0.28px] text-blue-500">
                    {formatDDay(s.dDay)}
                  </span>
                  <span className="text-[12px] font-normal leading-[150%] tracking-[-0.24px] text-gray-600">
                    {s.deadline ?? ''}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : scraps.length === 0 ? (
        // E-1: 스크랩 0건 (현행 유지 — 문구 변경 금지)
        <EmptyScrap onAction={handleGoToScrap} className="flex-1" />
      ) : (
        // E-2: 스크랩은 있으나 임박(upcoming) 없음
        // TODO(E-4): S1이 전부 dDay < 0(마감 지남)이면 "여유 있는 공고들뿐"은 부정확.
        //            디자이너 확인 대기. 그 전까지 E-2로 통합.
        <EmptyScrap
          title="아직 여유 있는 공고들뿐이에요"
          actionLabel="전체 스크랩 보기"
          onAction={() => navigate('/scrap')}
          className="flex-1"
        />
      )}
    </div>
  );
}
