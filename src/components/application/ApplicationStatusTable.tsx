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
  newlyAddedId: string | null;
  onNewlyAddedHandled: () => void;
  activeTab: string;
}

interface EditingState {
  itemId: string | null;
  field: keyof ApplicationItem | null;
}

const FIELD_ORDER: (keyof ApplicationItem)[] = [
  'company',
  'position',
  'stage',
  'appliedDate',
  'nextSchedule',
  'memo',
];

const EMPTY_MESSAGES: Record<string, string> = {
  all: '지원 공고를 추가하면 이 자리가 채워져요',
  expected: '공고를 담아 두면 지원 타이밍을 놓치지 않아요',
  ongoing: '단계가 통과되면 여기서 계속 이어가요',
  rejected: '아직 여기 채워질 일이 없어요',
  passed: '좋은 소식, 제일 먼저 여기 채워 드릴게요',
};

// ⚠️ 컴포넌트 바깥(모듈 스코프)에 정의 — 리렌더링마다 재생성되지 않도록 함
function EditableCell({
  item,
  field,
  value,
  onChange,
  editing,
  setEditing,
  onEditingChange,
  stageColors,
}: {
  item: ApplicationItem;
  field: keyof ApplicationItem;
  value: string;
  onChange: (value: string) => void;
  editing: EditingState;
  setEditing: (state: EditingState) => void;
  onEditingChange: (id: string | null) => void;
  stageColors: Record<string, string>;
}) {
  const isEditing = editing.itemId === item.id && editing.field === field;

  if (field === 'stage') {
    return (
      <div className="relative">
        <div
          onClick={() => {
            setEditing({ itemId: item.id, field });
            onEditingChange(item.id);
          }}
          className="px-2 py-1 rounded cursor-text hover:bg-app-primary/5 inline-block"
        >
          <span
            className={`inline-block px-3 py-1 rounded-[7px] text-xs font-medium ${
              stageColors[value] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {value}
          </span>
        </div>

        {isEditing && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/0"
              onClick={() => setEditing({ itemId: null, field: null })}
            />

            {/* 모달 */}
            <div
              data-stage-modal
              onClick={(e) => e.stopPropagation()}
              className="absolute top-full left-0 mt-2 bg-white rounded-lg p-3 w-[222px] h-[238px] z-[100] shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
            >
              <div className="space-y-2.5">
                {/* 지원예정 / 지원완료 */}
                <div>
                  <div className="text-[11px] text-gray-500 mb-2">진행 중</div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        onChange('지원예정');
                        setEditing({ itemId: null, field: null });
                      }}
                      className={`px-2.5 py-1 rounded-[7px] text-[11px] font-semibold ${
                        value === '지원예정'
                          ? 'bg-app-primary text-white'
                          : 'bg-[#FFF5E5] text-[#E49735]'
                      }`}
                    >
                      지원예정
                    </button>

                    <button
                      onClick={() => {
                        onChange('지원완료');
                        setEditing({ itemId: null, field: null });
                      }}
                      className={`px-2.5 py-1 rounded-[7px] text-[11px] font-semibold ${
                        value === '지원완료'
                          ? 'bg-app-primary text-white'
                          : 'bg-[#F3F3FC] text-[#5C69FF]'
                      }`}
                    >
                      지원완료
                    </button>
                  </div>
                </div>

                {/* 합격 */}
                <div>
                  <div className="text-[11px] text-gray-500 mb-2 mt-5">합격</div>
                  <div className="flex gap-2 flex-wrap">
                    {['서류합격', '면접합격', '최종합격'].map((stage) => (
                      <button
                        key={stage}
                        onClick={() => {
                          onChange(stage);
                          setEditing({ itemId: null, field: null });
                        }}
                        className={`px-2.5 py-1 rounded-[7px] text-[11px] font-semibold ${
                          value === stage
                            ? 'bg-app-primary text-white'
                            : 'bg-[#E8F8F1] text-[#35A97A]'
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 탈락 */}
                <div>
                  <div className="text-[11px] text-gray-500 mb-2 mt-5">탈락</div>
                  <div className="flex gap-2 flex-wrap">
                    {['서류탈락', '면접탈락'].map((stage) => (
                      <button
                        key={stage}
                        onClick={() => {
                          onChange(stage);
                          setEditing({ itemId: null, field: null });
                        }}
                        className={`px-2.5 py-1 rounded-[7px] text-[11px] font-semibold ${
                          value === stage
                            ? 'bg-app-primary text-white'
                            : 'bg-[#FDE7E9] text-[#F36975]'
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="h-full flex items-center -mt-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setEditing({ itemId: null, field: null })}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Enter') {
              const currentIndex = FIELD_ORDER.indexOf(field);
              if (currentIndex < FIELD_ORDER.length - 1) {
                setEditing({ itemId: item.id, field: FIELD_ORDER[currentIndex + 1] });
              } else {
                setEditing({ itemId: null, field: null });
              }
            }
          }}
          autoFocus
          className="w-[136px] h-[49] px-3 py-2 bg-white border-none rounded-[8px] text-sm"
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        setEditing({ itemId: item.id, field });
        onEditingChange(item.id);
      }}
      className="px-2 py-1 rounded cursor-text hover:bg-app-primary/5"
    >
      <span className="text-sm text-app-text">{value}</span>
    </div>
  );
}

// 삭제 확인 모달 - 모듈 스코프에 정의
function DeleteConfirmModal({
  company,
  position,
  onConfirm,
  onCancel,
}: {
  company: string;
  position: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 w-[420px] h-[272px] shadow-xl flex flex-col items-center"
      >
        <div className="flex justify-center mb-3">
          <span className="px-3 py-1 rounded-[99px] bg-[#F5F5FF] text-app-primary text-xs font-semibold">
            {company} · {position}
          </span>
        </div>

        <h3 className="text-center text-lg font-bold text-gray-900 mb-1">
          공고를 삭제할까요?
        </h3>
        <p className="text-center text-sm text-gray-500 mb-7">
          삭제하면 지원 기록과 메모 모두 삭제돼요
        </p>

        <button
          onClick={onConfirm}
          className="w-[324px] h-[45px] py-3 mb-2 rounded-xl bg-app-primary text-white font-semibold hover:opacity-90 transition-opacity"
        >
          삭제
        </button>
        <button
          onClick={onCancel}
          className="w-[324px] h-[45px] py-3 rounded-xl bg-gray-100 text-app-text-muted font-semibold hover:bg-app-hover transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  );
}

function ApplicationStatusTable({
  data,
  onEditingChange,
  onUpdateItem,
  onDeleteItem,
  stageColors,
  newlyAddedId,
  onNewlyAddedHandled,
  activeTab,
}: ApplicationStatusTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState<EditingState>({ itemId: null, field: null });
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // 새 행 추가 감지
  useEffect(() => {
    if (newlyAddedId) {
      setEditing({ itemId: newlyAddedId, field: 'company' });
      onEditingChange(newlyAddedId);
      onNewlyAddedHandled();
    }
  }, [newlyAddedId, onEditingChange, onNewlyAddedHandled]);

  // 모달 클릭 아웃사이드 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        setEditing({ itemId: null, field: null });
        onEditingChange(null);
      }

      if (editing.field === 'stage' && editing.itemId) {
        const stageModal = document.querySelector('[data-stage-modal]');
        if (stageModal && !stageModal.contains(e.target as Node)) {
          setEditing({ itemId: null, field: null });
          onEditingChange(null);
        }
      }
    };

    if (editing.itemId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editing.itemId, editing.field, onEditingChange]);

  const deleteTarget = data.find((item) => item.id === deleteTargetId);

  return (
    <div
      ref={tableRef}
      className="w-[808px] h-[715px] border border-[#EBECFF]/90 rounded-2xl overflow-hidden flex flex-col bg-white shadow-[0_4px_12px_rgba(124,119,255,0.08)]"
    >
      {/* 테이블 헤더 */}
      <div className="grid grid-cols-[108px_144px_98px_140px_135px_150px] gap-0 px-6 ml-2 py-4 bg-app-bg font-medium text-sm text-[#8995A2] items-start">
        <div>기업</div>
        <div>직무</div>
        <div>단계</div>
        <div>지원일(마감일)</div>
        <div>다음 일정</div>
        <div>메모</div>
      </div>

      <div className="mx-8">
        <div className="bg-gray-200 h-[1.5px]"></div>
      </div>

      {/* 테이블 바디 */}
      {data.length > 0 ? (
        <div className="flex-1 overflow-y-auto">
          {data.map((item) => (
            <div key={item.id} className="h-[50px]">
              <div
                className={`group grid grid-cols-[108px_144px_98px_140px_135px_150px] gap-0 px-6 h-full items-start pt-3 transition-colors rounded-[8px] ${
                  editing.itemId === item.id ? 'bg-[#F5F5FF] border border-blue-200' : 'hover:bg-app-bg'
                }`}
              >
                {/* 기업 */}
                <EditableCell
                  item={item}
                  field="company"
                  value={item.company}
                  onChange={(value) => onUpdateItem(item.id, 'company', value)}
                  editing={editing}
                  setEditing={setEditing}
                  onEditingChange={onEditingChange}
                  stageColors={stageColors}
                />

                {/* 직무 */}
                <EditableCell
                  item={item}
                  field="position"
                  value={item.position}
                  onChange={(value) => onUpdateItem(item.id, 'position', value)}
                  editing={editing}
                  setEditing={setEditing}
                  onEditingChange={onEditingChange}
                  stageColors={stageColors}
                />

                {/* 단계 */}
                <EditableCell
                  item={item}
                  field="stage"
                  value={item.stage}
                  onChange={(value) => onUpdateItem(item.id, 'stage', value)}
                  editing={editing}
                  setEditing={setEditing}
                  onEditingChange={onEditingChange}
                  stageColors={stageColors}
                />

                {/* 지원일 */}
                <EditableCell
                  item={item}
                  field="appliedDate"
                  value={item.appliedDate}
                  onChange={(value) => onUpdateItem(item.id, 'appliedDate', value)}
                  editing={editing}
                  setEditing={setEditing}
                  onEditingChange={onEditingChange}
                  stageColors={stageColors}
                />

                {/* 다음 일정 */}
                <EditableCell
                  item={item}
                  field="nextSchedule"
                  value={item.nextSchedule}
                  onChange={(value) => onUpdateItem(item.id, 'nextSchedule', value)}
                  editing={editing}
                  setEditing={setEditing}
                  onEditingChange={onEditingChange}
                  stageColors={stageColors}
                />

                {/* 메모 */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <EditableCell
                      item={item}
                      field="memo"
                      value={item.memo}
                      onChange={(value) => onUpdateItem(item.id, 'memo', value)}
                      editing={editing}
                      setEditing={setEditing}
                      onEditingChange={onEditingChange}
                      stageColors={stageColors}
                    />
                  </div>

                  {/* 삭제 버튼 - 클릭 시 확인 모달 오픈 */}
                  <button
                    onClick={() => setDeleteTargetId(item.id)}
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

              <div className="mx-8">
                <div className="bg-gray-200 h-[0.6px]"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-white via-white to-[#EDEBFF]">
          <img src="/empty-page.png" alt="빈 상태" className="w-[259px] h-[235px] mb-6" />
          <p className="text-[20px] font-semibold text-app-text">
            {EMPTY_MESSAGES[activeTab] || '지원 현황이 없습니다'}
          </p>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <DeleteConfirmModal
          company={deleteTarget.company}
          position={deleteTarget.position}
          onConfirm={() => {
            onDeleteItem(deleteTarget.id);
            setDeleteTargetId(null);
          }}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  );
}

export default memo(ApplicationStatusTable);