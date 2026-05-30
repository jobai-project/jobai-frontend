import { memo } from 'react';
import type { Job } from '@/types/job';

interface DetailContentProps {
  job: Job;
}

interface RequirementItem {
  label: string;
  value: string | string[];
  matched: boolean;
}

const RequirementRow = memo(
  ({ label, value, matched }: RequirementItem) => {
    const isArray = Array.isArray(value);

    return (
      <div className="rounded-lg border border-app-border bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-app-text">{label}</h4>
          {matched ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" fill="#10B981" />
              <path
                d="M7 10L9 12L13 8"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" fill="#EF4444" />
              <path
                d="M10 7V13M7 10H13"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {isArray ? (
          <div className="flex flex-wrap gap-2">
            {value.map((item) => (
              <span
                key={item}
                className="rounded-md border border-app-border bg-app-bg px-3 py-1.5 text-xs text-app-text-muted"
              >
                {item}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-app-text">{value}</p>
        )}
      </div>
    );
  },
);

RequirementRow.displayName = 'RequirementRow';

function QualificationContent({ job }: DetailContentProps) {
  const requirements: RequirementItem[] = [
    {
      label: '경력',
      value: job.requirements?.experience ?? 'Frontend 개발 경력 3~7년',
      matched: true,
    },
    {
      label: '학력',
      value: job.requirements?.education ?? '4년제 학사 이상',
      matched: false,
    },
    {
      label: '가능',
      value: job.requirements?.skills ?? [
        'React',
        'TypeScript',
        'Zustand',
        'Redux Toolkit',
      ],
      matched: true,
    },
  ];

  return (
    <div className="space-y-4">
      {requirements.map((req) => (
        <RequirementRow
          key={req.label}
          label={req.label}
          value={req.value}
          matched={req.matched}
        />
      ))}
    </div>
  );
}

export default memo(QualificationContent);