import { memo } from 'react';

interface ApplicationItem {
  id: string;
  company: string;
  position: string;
  stage: string;
  appliedDate: string;
  nextSchedule: string;
  memo: string;
}

interface ApplicationStatusTableProps {
  data: ApplicationItem[];
  editingId: string | null;
  onEditingChange: (id: string | null) => void;
  onUpdateItem: (id: string, field: keyof ApplicationItem, value: string) => void;
  onDeleteItem: (id: string) => void;
  stageColors: Record<string, string>;
}

const STAGE_OPTIONS = [
  '지원예정',
  '지원해석',
  '지원완료',
  '면접중',
  '서류합격',
  '면접합격',
  '탈락',
  '최종합격',
];

function ApplicationStatusTable({
  data,
  editingId,
  onEditingChange,
  onUpdateItem,
  onDeleteItem,
  stageColors,
}: ApplicationStatusTableProps) {
  return (
    <div className="border border-app-border rounded-lg overflow-hidden bg-white">
      {/* 테이블 헤더 */}
      <div className="grid grid-cols-[150px_150px_120px_120px_120px_150px] gap-0 px-6 py-4 bg-app-bg font-semibold text-sm text-app-text border-b border-app-border">
        <div>기업</div>
        <div>직무</div>
        <div className="text-center">단계</div>
        <div className="text-center">지원일(마감일)</div>
        <div className="text-center">다음 일정</div>
        <div>메모</div>
      </div>

      {/* 테이블 바디 */}
      {data.length > 0 ? (
        data.map((item) => (
          <div
            key={item.id}
            className="group grid grid-cols-[150px_150px_120px_120px_120px_150px] gap-0 px-6 py-4 border-b border-app-border items-center hover:bg-app-bg transition-colors"
          >
            {/* 기업 */}
            {editingId === item.id ? (
              <input
                type="text"
                value={item.company}
                onChange={(e) => onUpdateItem(item.id, 'company', e.target.value)}
                className="px-2 py-1 border border-app-border rounded text-sm"
              />
            ) : (
              <div
                className="text-sm text-app-text cursor-text hover:bg-app-primary/10 px-2 py-1 rounded"
                onClick={() => onEditingChange(item.id)}
              >
                {item.company}
              </div>
            )}

            {/* 직무 */}
            {editingId === item.id ? (
              <input
                type="text"
                value={item.position}
                onChange={(e) => onUpdateItem(item.id, 'position', e.target.value)}
                className="px-2 py-1 border border-app-border rounded text-sm"
              />
            ) : (
              <div
                className="text-sm text-app-text cursor-text hover:bg-app-primary/10 px-2 py-1 rounded"
                onClick={() => onEditingChange(item.id)}
              >
                {item.position}
              </div>
            )}

            {/* 단계 */}
            {editingId === item.id ? (
              <select
                value={item.stage}
                onChange={(e) => onUpdateItem(item.id, 'stage', e.target.value)}
                className="px-2 py-1 border border-app-border rounded text-sm text-center"
              >
                <option value="">선택</option>
                {STAGE_OPTIONS.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-center">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    stageColors[item.stage] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {item.stage}
                </span>
              </div>
            )}

            {/* 지원일 */}
            {editingId === item.id ? (
              <input
                type="text"
                value={item.appliedDate}
                onChange={(e) => onUpdateItem(item.id, 'appliedDate', e.target.value)}
                className="px-2 py-1 border border-app-border rounded text-sm text-center"
              />
            ) : (
              <div
                className="text-sm text-app-text text-center cursor-text hover:bg-app-primary/10 px-2 py-1 rounded"
                onClick={() => onEditingChange(item.id)}
              >
                {item.appliedDate}
              </div>
            )}

            {/* 다음 일정 */}
            {editingId === item.id ? (
              <input
                type="text"
                value={item.nextSchedule}
                onChange={(e) => onUpdateItem(item.id, 'nextSchedule', e.target.value)}
                className="px-2 py-1 border border-app-border rounded text-sm text-center"
              />
            ) : (
              <div
                className="text-sm text-app-text text-center cursor-text hover:bg-app-primary/10 px-2 py-1 rounded"
                onClick={() => onEditingChange(item.id)}
              >
                {item.nextSchedule}
              </div>
            )}

            {/* 메모 */}
            <div className="flex items-center justify-between">
              {editingId === item.id ? (
                <input
                  type="text"
                  value={item.memo}
                  onChange={(e) => onUpdateItem(item.id, 'memo', e.target.value)}
                  className="flex-1 px-2 py-1 border border-app-border rounded text-sm"
                />
              ) : (
                <div
                  className="flex-1 text-sm text-app-text cursor-text hover:bg-app-primary/10 px-2 py-1 rounded"
                  onClick={() => onEditingChange(item.id)}
                >
                  {item.memo}
                </div>
              )}

              {/* 삭제 버튼 */}
              <button
                onClick={() => onDeleteItem(item.id)}
                className="ml-2 p-1 text-app-text-muted hover:text-app-text opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 3L13 13M13 3L3 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="px-6 py-12 text-center text-app-text-muted">
          지원 현황이 없습니다
        </div>
      )}
    </div>
  );
}

export default memo(ApplicationStatusTable);