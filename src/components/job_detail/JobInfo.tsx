import { memo } from 'react';
import type { JobDetail } from '@/types/jobApi';

interface JobInfoProps {
  job: JobDetail;
}

function JobInfo({ job }: JobInfoProps) {
  // deadline null = 상시모집 (목록 카드와 동일 규칙)
  const deadlineText = job.deadline ?? '상시모집';
  // 시작일·모집직무는 소스별 필드 → source 판별로 좁혀 조건부 렌더
  const beginDate = job.source === 'PUBLIC' ? job.beginDate : null;
  const jobRole = job.source === 'PRIVATE' ? job.jobCategory : job.jobRole;

  // 라벨/값 공통 타이포 — 라벨 18 SemiBold #687685(app-text-muted) / 값 18 Regular #000.
  const label = 'text-[18px] font-semibold text-app-text-muted';
  const value = 'text-[18px] font-normal text-black';

  return (
    <div className="flex flex-col gap-[32px]">
      {/* Figma 1428:14125 회사행 — 회사명 24 SemiBold #000 + 업종(IT/플랫폼) 14 Regular #5b5b5b */}
      <div className="flex items-end gap-[20px]">
        <h2 className="text-[24px] font-semibold tracking-[-0.48px] text-black">
          {job.company}
        </h2>
        {/* TODO(D2): 업종 라벨(IT/플랫폼) — companySize/industry 필드 미확정(검색 G3 동일 이슈) → 미렌더 */}
      </div>

      {/* Figma 1428:14128 — 좌블록 w-348(기업형태·고용형태·근무지역) / 우블록 w-253(접수기간·모집직무) */}
      <div className="flex gap-[20px]">
        {/* 좌블록 */}
        <div className="flex w-[348px] flex-col gap-[20px]">
          <div className="flex items-center gap-[20px]">
            <span className={label}>기업형태</span>
            {/* 기업형태는 현행(source 파생) 유지 — 규모(대기업)는 별도 필드로 미확정(D2) */}
            <span className={value}>{job.source === 'PUBLIC' ? '공기업' : '사기업'}</span>
          </div>
          <div className="flex items-center gap-[20px]">
            <span className={label}>고용형태</span>
            <span className={value}>{job.employmentType || '-'}</span>
          </div>
          <div className="flex items-center gap-[20px]">
            <span className={label}>근무지역</span>
            <span className={value}>{job.location || '-'}</span>
          </div>
        </div>

        {/* 우블록 */}
        <div className="flex w-[253px] flex-col gap-[32px]">
          {/* 접수기간 — 시작일은 PUBLIC(beginDate) 전용 → PRIVATE 은 행 자체 미렌더("-" 금지) */}
          <div className="flex items-start gap-[20px]">
            <span className={label}>접수기간</span>
            <div className="flex flex-col gap-[12px]">
              {beginDate && (
                <div className="flex items-center gap-[20px]">
                  {/* 시작일/마감일 16px — 라벨 #9B9B9B / 값 #545454 (토큰 없음 → arbitrary) */}
                  <span className="text-[16px] text-[#9B9B9B]">시작일</span>
                  <span className="text-[16px] text-[#545454]">{beginDate}</span>
                </div>
              )}
              <div className="flex items-center gap-[20px]">
                <span className="text-[16px] text-[#9B9B9B]">마감일</span>
                <span className="text-[16px] text-[#545454]">{deadlineText}</span>
              </div>
            </div>
          </div>

          {jobRole && (
            <div className="flex items-center gap-[20px]">
              <span className={label}>모집직무</span>
              <span className={value}>{jobRole}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(JobInfo);
