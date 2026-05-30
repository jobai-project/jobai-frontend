import { memo } from 'react';
import type { Job } from '@/types/job';

interface JobInfoProps {
  job: Job;
}

function JobInfo({ job }: JobInfoProps) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-base font-bold text-app-text">{job.company}</h2>
        <span className="rounded-full border border-app-border bg-app-bg px-2.5 py-0.5 text-xs font-medium text-app-text-muted">
          IT/웹/통신
        </span>
      </div>

      <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-x-8 gap-y-3 text-sm">

        <div className="text-app-text-muted">기업형태</div>
        <div className="text-app-text font-medium">
          {job.companyType === 'PUBLIC' ? '공기업' : '사기업'}
        </div>

        <div className="text-app-text-muted">접수기간</div>
        <div className="flex flex-col gap-y-1 text-app-text font-medium">
            <div>
                <span className="text-app-text-muted mr-1">시작일</span> 
                <span>2026. 05. 15</span>
            </div>
            <div>
                <span className="text-app-text-muted mr-1">마감일</span> 
                <span>상시모집</span>
            </div>
        </div>

        <div className="text-app-text-muted">고용형태</div>
        <div className="text-app-text font-medium">{job.employmentType ?? '정규직'}</div>

        <div className="text-app-text-muted">접수방법</div>
        <div className="font-medium">
        {job.applyUrl ? (
            <a 
            href={job.applyUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 underline hover:text-blue-600 transition-colors"
            >
            홈페이지
            </a>
        ) : (
            <span className="text-app-text-muted">홈페이지 (정보 없음)</span>
        )}
        </div>

        <div className="text-app-text-muted">근무지역</div>
        <div className="text-app-text font-medium">{job.location ?? '서울 중구 을지로'}</div>

        <div className="text-app-text-muted">모집직무</div>
        <div className="text-app-text font-medium">IT/인터넷</div>
      </div>
    </div>
  );
}

export default memo(JobInfo);