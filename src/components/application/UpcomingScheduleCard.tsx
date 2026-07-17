import { useUpcomingInterviews } from '@/hooks/useApplications';

// daysLeft(서버 계산값)를 그대로 표시. 재계산 금지 — 어긋나면 백엔드 타임존(KST) 이슈.
const dday = (d: number) => (d === 0 ? 'D-Day' : `D-${d}`);

// 다가오는 일정 카드 — 면접 D-day 최대 3건(서버가 정렬·최대 3·null 제외).
// G2: 면접 차수 필드가 없어 상단 회사명 / 하단 직무명으로 표시.
export default function UpcomingScheduleCard() {
  const { data, isLoading, isError } = useUpcomingInterviews();

  if (isLoading) {
    return (
      <div className="h-[220px] w-[256px] animate-pulse rounded-[14px] bg-[#F2F4F6]" />
    );
  }
  if (isError) {
    return (
      <div className="flex h-[220px] w-[256px] items-center justify-center rounded-[14px] border border-[#EBECFF] bg-white text-[12px] text-[#8995A2] shadow-[0_0_15.2px_rgba(118,85,255,0.06)]">
        일정을 불러오지 못했어요.
      </div>
    );
  }

  const items = data ?? [];

  return (
    <div className="w-[256px] rounded-[14px] border border-[#EBECFF] bg-white px-6 pb-5 pt-4 shadow-[0_0_15.2px_rgba(118,85,255,0.06)]">
      <div className="flex items-center gap-1.5">
        <img src="/calendar-icon.png" alt="" aria-hidden className="h-6 w-6" />
        <span className="text-[15px] font-semibold text-[#171F29]">
          다가오는 다음 일정
        </span>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-[12px] text-[#8995A2]">예정된 면접이 없어요.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {items.map((s, i) => (
            <li
              key={s.applicationId}
              className={`flex items-end justify-between ${
                i > 0 ? 'border-t border-[#EBECFF] pt-3' : ''
              }`}
            >
              <div className="flex min-w-0 flex-col gap-2">
                <p className="truncate text-[14px] font-medium text-[#171F29]">
                  {s.companyName}
                </p>
                <p className="truncate text-[12px] text-[#687685]">
                  {s.jobTitle}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <p className="text-[13px] font-medium text-[#4741FF]">
                  {dday(s.daysLeft)}
                </p>
                <div className="flex items-center gap-1">
                  <img
                    src="/time-icon.png"
                    alt=""
                    aria-hidden
                    className="h-4 w-4"
                  />
                  <span className="text-[11px] text-[#687685]">
                    {s.interviewAt}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
