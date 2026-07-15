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
  // 실제 API 호출(PATCH)이 필요한 시점(blur, 선택 확정)에만 호출된다.
  // onUpdateItem은 매 keystroke마다 로컬 상태만 갱신하고, onCommitField가 서버 반영을 담당한다.
  onCommitField: (id: string, field: keyof ApplicationItem) => void;
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

const EMPTY_MESSAGES: Record<string, { title: string; desc?: string }> = {
  all: { title: '아직 등록된 지원 현황이 없어요', desc: '공고 추가 버튼으로 첫 지원 현황을 등록해보세요' },
  expected: { title: '지원 예정인 공고가 없어요' },
  ongoing: { title: '진행 중인 지원이 없어요', desc: '지원 중인 공고가 여기에 표시돼요' },
  rejected: { title: '탈락한 공고가 없어요' },
  passed: { title: '최종합격한 공고가 없어요' },
};

// ⚠️ 컴포넌트 바깥(모듈 스코프)에 정의 — 리렌더링마다 재생성되지 않도록 함
// (내부에 있으면 매 렌더링마다 함수가 새로 만들어져 <input> DOM이 리마운트되고,
//  그 과정에서 한글 IME 조합이 끊겨 낱자로 분리되어 보이는 문제가 발생함)
function EditableCell({
  item,
  field,
  value,
  onChange,
  onCommit,
  onValidationFail,
  editing,
  setEditing,
  onEditingChange,
  stageColors,
}: {
  item: ApplicationItem;
  field: keyof ApplicationItem;
  value: string;
  onChange: (value: string) => void;
  onCommit: () => void;
  onValidationFail?: (message: string) => void;
  editing: EditingState;
  setEditing: (state: EditingState) => void;
  onEditingChange: (id: string | null) => void;
  stageColors: Record<string, string>;
}) {
  const isEditing = editing.itemId === item.id && editing.field === field;
  const inputRef = useRef<HTMLInputElement>(null);

  // 단계(stage) - 버튼 항상 표시, 클릭 시 모달
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
            {/* 반투명 배경 - 모달 밖 클릭 감지 */}
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
                        onCommit();
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
                        onCommit();
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
                          onCommit();
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
                          onCommit();
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
    const isRequiredField = field === 'company' || field === 'position';
    const isTempRow = item.id.startsWith('temp-');
    const siblingValue = field === 'company' ? item.position : item.company;

    // 회사명/직무 벗어남 검증:
    // - 임시(미생성) 행: 회사명·직무가 둘 다 비어있으면 벗어남 허용(=자동 삭제로 이어짐)
    //   하나만 비어있으면 벗어남을 막고 안내한다.
    // - 이미 저장된 행: 서버가 두 필드 모두 필수이므로 비운 채로는 항상 벗어남을 막는다.
    const tryLeave = () => {
      if (isRequiredField && value.trim() === '') {
        const bothEmpty = isTempRow && siblingValue.trim() === '';
        if (!bothEmpty) {
          onValidationFail?.(
            field === 'company' ? '회사명을 입력해주세요' : '직무를 입력해주세요',
          );
          // 벗어나지 못하게 포커스를 다시 준다.
          requestAnimationFrame(() => {
            inputRef.current?.focus();
          });
          return false;
        }
      }
      onCommit();
      return true;
    };

    return (
      <div className="h-full flex items-center -mt-1">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => {
            const left = tryLeave();
            if (left) {
              setEditing({ itemId: null, field: null });
            }
          }}
          onKeyDown={(e) => {
            // 한글 조합 중에는 Enter로 다음 칸 이동하지 않음
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Enter') {
              const left = tryLeave();
              if (!left) return;
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
  onCommitField,
  onDeleteItem,
  stageColors,
  newlyAddedId,
  onNewlyAddedHandled,
  activeTab,
}: ApplicationStatusTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState<EditingState>({ itemId: null, field: null });
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // 현재 편집 중인 필드가 회사명/직무이고 값이 비어있는데, 벗어날 수 없는 상태인지 확인.
  // (임시 행은 회사명·직무가 둘 다 비었을 때만 벗어남 허용, 저장된 행은 항상 필수)
  const isCurrentEditBlocked = () => {
    if (editing.field !== 'company' && editing.field !== 'position') return false;
    const item = data.find((d) => d.id === editing.itemId);
    if (!item) return false;

    const value = editing.field === 'company' ? item.company : item.position;
    if (value.trim() !== '') return false;

    const isTempRow = item.id.startsWith('temp-');
    const sibling = editing.field === 'company' ? item.position : item.company;
    const bothEmpty = isTempRow && sibling.trim() === '';
    return !bothEmpty;
  };

  // 새 행 추가 감지
  useEffect(() => {
    if (newlyAddedId) {
      setEditing({ itemId: newlyAddedId, field: 'company' });
      onEditingChange(newlyAddedId);
      onNewlyAddedHandled();
    }
  }, [newlyAddedId, onEditingChange, onNewlyAddedHandled]);

  // 모달/편집 상태 바깥 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        // 회사명/직무가 필수 조건을 만족하지 못하면 바깥을 클릭해도 편집 상태를 유지한다.
        if (isCurrentEditBlocked()) {
          showToast(
            editing.field === 'company' ? '회사명을 입력해주세요' : '직무를 입력해주세요',
          );
          return;
        }
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
  }, [editing.itemId, editing.field, onEditingChange, data]);

  const deleteTarget = data.find((item) => item.id === deleteTargetId);

  return (
    <div
      ref={tableRef}
      className="w-[808px] h-[715px] border border-[#EBECFF]/90 rounded-2xl overflow-hidden flex flex-col bg-white shadow-[0_4px_12px_rgba(124,119,255,0.08)]"
    >
      {/* 테이블 헤더 */}
      <div className="grid grid-cols-[108px_144px_98px_140px_135px_150px] gap-0 px-6 ml-4 py-4 bg-app-bg font-medium text-sm text-[#8995A2] items-start">
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
                  onCommit={() => onCommitField(item.id, 'company')}
                  onValidationFail={showToast}
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
                  onCommit={() => onCommitField(item.id, 'position')}
                  onValidationFail={showToast}
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
                  onCommit={() => onCommitField(item.id, 'stage')}
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
                  onCommit={() => onCommitField(item.id, 'appliedDate')}
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
                  onCommit={() => onCommitField(item.id, 'nextSchedule')}
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
                      onCommit={() => onCommitField(item.id, 'memo')}
                      editing={editing}
                      setEditing={setEditing}
                      onEditingChange={onEditingChange}
                      stageColors={stageColors}
                    />
                  </div>

                  {/* 삭제 버튼 */}
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

              {/* 구분선 */}
              <div className="mx-8">
                <div className="bg-gray-200 h-[0.6px]"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-white via-white to-[#EDEBFF]">
          <img src="/empty-page.png" alt="빈 상태" className="w-[259px] h-[235px] mb-4" />
          <p className="text-base font-semibold text-app-text">
            {EMPTY_MESSAGES[activeTab]?.title ?? '지원 현황이 없습니다'}
          </p>
          {EMPTY_MESSAGES[activeTab]?.desc && (
            <p className="text-sm text-app-text-muted mt-1">
              {EMPTY_MESSAGES[activeTab].desc}
            </p>
          )}
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

      {/* 필수값 안내 토스트 */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default memo(ApplicationStatusTable);