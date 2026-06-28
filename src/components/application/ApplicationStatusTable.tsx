import { memo, useRef, useEffect, useState } from 'react';

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

interface EditingState {
  itemId: string | null;
  field: keyof ApplicationItem | null;
}

function ApplicationStatusTable({
  data,
  onEditingChange,
  onUpdateItem,
  onDeleteItem,
  stageColors,
}: ApplicationStatusTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState<EditingState>({ itemId: null, field: null });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        setEditing({ itemId: null, field: null });
        onEditingChange(null);
      }
    };

    if (editing.itemId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editing.itemId, onEditingChange]);

  const EditableCell = ({
    item,
    field,
    value,
    onChange,
  }: {
    item: ApplicationItem;
    field: keyof ApplicationItem;
    value: string;
    onChange: (value: string) => void;
  }) => {
    const isEditing = editing.itemId === item.id && editing.field === field;

    if (isEditing && field === 'stage') {
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setEditing({ itemId: null, field: null })}
          autoFocus
          className="w-full px-3 py-2 bg-white border-none rounded text-sm text-center"
        >
          <option value="">선택</option>
          {STAGE_OPTIONS.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
      );
    }

    if (isEditing) {
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setEditing({ itemId: null, field: null })}
          autoFocus
          className={`w-full px-3 py-2 bg-white border-none rounded text-sm ${
            field === 'stage' || field === 'appliedDate' || field === 'nextSchedule'
              ? 'text-center'
              : ''
          }`}
        />
      );
    }

    return (
      <div
        onClick={() => {
          setEditing({ itemId: item.id, field });
          onEditingChange(item.id);
        }}
        className={`px-2 py-1 rounded cursor-text hover:bg-app-primary/5 ${
          field === 'stage' || field === 'appliedDate' || field === 'nextSchedule'
            ? 'text-center'
            : ''
        }`}
      >
        {field === 'stage' ? (
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              stageColors[value] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {value}
          </span>
        ) : (
          <span className="text-sm text-app-text">{value}</span>
        )}
      </div>
    );
  };

  return (
    <div
      ref={tableRef}
      className="border border-app-border rounded-lg overflow-hidden bg-white"
    >
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
            className={`group grid grid-cols-[150px_150px_120px_120px_120px_150px] gap-0 px-6 py-4 border-b border-app-border items-center transition-colors ${
              editing.itemId === item.id ? 'bg-blue-50' : 'hover:bg-app-bg'
            }`}
          >
            {/* 기업 */}
            <EditableCell
              item={item}
              field="company"
              value={item.company}
              onChange={(value) => onUpdateItem(item.id, 'company', value)}
            />

            {/* 직무 */}
            <EditableCell
              item={item}
              field="position"
              value={item.position}
              onChange={(value) => onUpdateItem(item.id, 'position', value)}
            />

            {/* 단계 */}
            <EditableCell
              item={item}
              field="stage"
              value={item.stage}
              onChange={(value) => onUpdateItem(item.id, 'stage', value)}
            />

            {/* 지원일 */}
            <EditableCell
              item={item}
              field="appliedDate"
              value={item.appliedDate}
              onChange={(value) => onUpdateItem(item.id, 'appliedDate', value)}
            />

            {/* 다음 일정 */}
            <EditableCell
              item={item}
              field="nextSchedule"
              value={item.nextSchedule}
              onChange={(value) => onUpdateItem(item.id, 'nextSchedule', value)}
            />

            {/* 메모 */}
            <div className="flex items-center justify-between">
              <EditableCell
                item={item}
                field="memo"
                value={item.memo}
                onChange={(value) => onUpdateItem(item.id, 'memo', value)}
              />

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
          지원 현황이 없습니다.
        </div>
      )}
    </div>
  );
}

export default memo(ApplicationStatusTable);