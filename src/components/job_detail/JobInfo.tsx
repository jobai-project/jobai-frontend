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

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        {/* A-1 회사명 — 24 SemiBold #000 (Bold→SemiBold, 16→24) */}
        <h2 className="text-[24px] font-semibold text-black">{job.company}</h2>
        {/* ❓ B-2 업종 라벨(IT/플랫폼)은 BLOCKED(필드 미확인) → 추가하지 않음 */}
      </div>

      {/* A-1 정보 라벨 18 SemiBold #687685(토큰 유지) / 값 18 Regular #000 */}
      <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-x-8 gap-y-3">
        <div className="text-[18px] font-semibold text-app-text-muted">기업형태</div>
        <div className="text-[18px] font-normal text-black">
          {job.source === 'PUBLIC' ? '공기업' : '사기업'}
        </div>

        <div className="text-[18px] font-semibold text-app-text-muted">접수기간</div>
        <div className="flex flex-col gap-y-1">
          {beginDate && (
            <div>
              {/* A-1 시작일/마감일 라벨 16 #9B9B9B · 값 16 #545454. ❓ 두 색 토큰 없음 → arbitrary */}
              <span className="mr-1 text-[16px] text-[#9B9B9B]">시작일</span>
              <span className="text-[16px] text-[#545454]">{beginDate}</span>
            </div>
          )}
          <div>
            <span className="mr-1 text-[16px] text-[#9B9B9B]">마감일</span>
            <span className="text-[16px] text-[#545454]">{deadlineText}</span>
          </div>
        </div>

        <div className="text-[18px] font-semibold text-app-text-muted">고용형태</div>
        <div className="text-[18px] font-normal text-black">{job.employmentType || '-'}</div>

        <div className="text-[18px] font-semibold text-app-text-muted">근무지역</div>
        <div className="text-[18px] font-normal text-black">{job.location || '-'}</div>

        {jobRole && (
          <>
            <div className="text-[18px] font-semibold text-app-text-muted">모집직무</div>
            <div className="text-[18px] font-normal text-black">{jobRole}</div>
          </>
        )}
      </div>
    </div>
  );
}

export default memo(JobInfo);
