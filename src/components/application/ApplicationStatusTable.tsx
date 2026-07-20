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
  // valueOverride: stage 버튼처럼 onChange 직후 같은 이벤트 핸들러 안에서 바로
  // onCommit이 호출되는 경우, 아직 리렌더링 전이라 data에서 다시 읽으면
  // "직전 값"을 읽게 된다. 이 경우 방금 선택된 값을 직접 넘겨 그 문제를 피한다.
  onCommitField: (id: string, field: keyof ApplicationItem, valueOverride?: string) => void;
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
  requestEdit,
  stageColors,
}: {
  item: ApplicationItem;
  field: keyof ApplicationItem;
  value: string;
  onChange: (value: string) => void;
  onCommit: (valueOverride?: string) => void;
  onValidationFail?: (message: string) => void;
  editing: EditingState;
  // 지금 열려있는 셀 "자신"을 닫을 때만 쓴다 (blur/Enter/선택 확정 등).
  setEditing: (state: EditingState) => void;
  // 다른 셀로 편집을 "옮기려고 할 때" 반드시 이 함수를 통해야 한다.
  // 현재 편집 중인 셀이 필수값 미충족이면 여기서 막히고 토스트가 뜬다.
  requestEdit: (target: EditingState) => void;
  stageColors: Record<string, string>;
}) {
  const isEditing = editing.itemId === item.id && editing.field === field;
  const inputRef = useRef<HTMLInputElement>(null);

  // 단계(stage) - 버튼 항상 표시, 클릭 시 모달
  if (field === 'stage') {
    const selectStage = (stageValue: string) => {
      onChange(stageValue);
      onCommit(stageValue); // 방금 고른 값을 직접 넘겨 stale data 문제 회피
      setEditing({ itemId: null, field: null });
    };

    return (
      <div className="relative">
        <div
          onClick={() => requestEdit({ itemId: item.id, field })}
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
                      onClick={() => selectStage('지원예정')}
                      className={`px-2.5 py-1 rounded-[7px] text-[11px] font-semibold ${
                        value === '지원예정'
                          ? 'bg-app-primary text-white'
                          : 'bg-[#FFF5E5] text-[#E49735]'
                      }`}
                    >
                      지원예정
                    </button>

                    <button
                      onClick={() => selectStage('지원완료')}
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
                        onClick={() => selectStage(stage)}
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
                        onClick={() => selectStage(stage)}
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

    // 회사명/직무는 예외 없이 항상 채워야 벗어날 수 있다.
    // (행을 포기하고 싶으면 휴지통 아이콘으로 명시적으로 삭제해야 한다 — 텍스트를
    //  비운 채로 벗어나는 것만으로는 절대 행이 사라지지 않는다.)
    const tryLeave = () => {
      if (isRequiredField && value.trim() === '') {
        onValidationFail?.(
          field === 'company' ? '회사명을 입력해주세요' : '직무를 입력해주세요',
        );
        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
        return false;
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
            } else {
              // 포커스가 이미 빠져나간 상태이므로, 강제로 다시 이 입력창에 포커스를 돌려준다.
              requestAnimationFrame(() => {
                inputRef.current?.focus();
              });
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
          className="w-full h-[49] px-3 py-2 bg-white border-none rounded-[8px] text-sm"
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => requestEdit({ itemId: item.id, field })}
      className="inline-block min-w-[16px] min-h-[20px] px-2 py-1 rounded cursor-text hover:bg-app-primary/5"
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

  // 지금 편집 중인 필드가 회사명/직무이고 비어있으면 예외 없이 항상 막는다.
  // (임시 행이든 저장된 행이든 동일 — 행을 지우고 싶으면 휴지통 아이콘을 써야 한다.)
  const isCurrentEditBlocked = () => {
    if (editing.field !== 'company' && editing.field !== 'position') return false;
    const item = data.find((d) => d.id === editing.itemId);
    if (!item) return false;
    const value = editing.field === 'company' ? item.company : item.position;
    return value.trim() === '';
  };

  // 편집 상태를 다른 셀로 옮기려는 모든 시도(다른 열 클릭, 다른 행 클릭,
  // 단계 셀 클릭 등)는 반드시 이 함수를 거친다. 지금 편집 중인 셀이 필수값을
  // 채우지 못했으면 여기서 전환 자체를 막고 토스트를 띄운다 — 클릭 위치가
  // 테이블 안이든 밖이든, 같은 행의 다른 열이든 상관없이 동일하게 적용된다.
  const requestEdit = (target: EditingState) => {
    // 지금 아무것도 편집 중이 아니거나, 같은 셀을 다시 클릭한 경우는 그냥 통과.
    if (!editing.itemId || (editing.itemId === target.itemId && editing.field === target.field)) {
      setEditing(target);
      if (target.itemId) onEditingChange(target.itemId);
      return;
    }

    if (isCurrentEditBlocked()) {
      showToast(
        editing.field === 'company' ? '회사명을 입력해주세요' : '직무를 입력해주세요',
      );
      return; // 전환 자체를 막음 — 편집 상태 그대로 유지
    }

    // 벗어나는 게 허용된 경우, blur 이벤트 타이밍에 기대지 않고 여기서 직접 커밋한다.
    if (editing.field && editing.field !== 'stage') {
      onCommitField(editing.itemId, editing.field);
    }

    setEditing(target);
    if (target.itemId) onEditingChange(target.itemId);
  };

  // 새 행 추가 감지
  useEffect(() => {
    if (newlyAddedId) {
      setEditing({ itemId: newlyAddedId, field: 'company' });
      onEditingChange(newlyAddedId);
      onNewlyAddedHandled();
    }
  }, [newlyAddedId, onEditingChange, onNewlyAddedHandled]);

  // 모달/편집 상태 바깥 클릭 감지 — 여기도 requestEdit과 동일한 규칙(필수값
  // 미충족이면 막고 토스트)을 그대로 적용해 테이블 안/밖 어디든 일관되게 동작한다.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        requestEdit({ itemId: null, field: null });
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
  }, [editing.itemId, editing.field, onEditingChange, data, onCommitField]);

  const deleteTarget = data.find((item) => item.id === deleteTargetId);

  return (
    <div
      ref={tableRef}
      className="w-[808px] h-[715px] border border-[#EBECFF]/90 rounded-2xl overflow-hidden flex flex-col bg-white shadow-[0_4px_12px_rgba(124,119,255,0.08)]"
    >
      {/* 테이블 헤더 */}
      <div className="grid grid-cols-[108px_144px_98px_124px_124px_150px_28px] gap-0 px-6 py-4 ml-2 bg-app-bg font-medium text-sm text-[#8995A2] items-start">
        <div>기업</div>
        <div>직무</div>
        <div>단계</div>
        <div>지원일(마감일)</div>
        <div>다음 일정</div>
        <div>메모</div>
        <div />
      </div>

      <div className="mx-8">
        <div className="bg-gray-200 h-[1.5px]"></div>
      </div>

      {/* 테이블 바디 */}
      {data.length > 0 ? (
        <div className="flex-1 overflow-y-auto">
          {data.map((item) => (
            <div key={item.id} className="min-h-[50px]">
              <div
                className={`group grid grid-cols-[108px_144px_98px_124px_124px_150px_28px] gap-0 px-6 min-h-[50px] items-center py-2 transition-colors rounded-[8px] ${
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
                  requestEdit={requestEdit}
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
                  requestEdit={requestEdit}
                  stageColors={stageColors}
                />

                {/* 단계 */}
                <EditableCell
                  item={item}
                  field="stage"
                  value={item.stage}
                  onChange={(value) => onUpdateItem(item.id, 'stage', value)}
                  onCommit={(v) => onCommitField(item.id, 'stage', v)}
                  editing={editing}
                  setEditing={setEditing}
                  requestEdit={requestEdit}
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
                  requestEdit={requestEdit}
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
                  requestEdit={requestEdit}
                  stageColors={stageColors}
                />

                {/* 메모 - 다른 필드와 완전히 동일한 순수 칸 (감싸는 flex/삭제버튼 없음) */}
                <EditableCell
                  item={item}
                  field="memo"
                  value={item.memo}
                  onChange={(value) => onUpdateItem(item.id, 'memo', value)}
                  onCommit={() => onCommitField(item.id, 'memo')}
                  editing={editing}
                  setEditing={setEditing}
                  requestEdit={requestEdit}
                  stageColors={stageColors}
                />

                {/* 삭제 버튼 - 메모와 완전히 분리된 독립 칸(7번째 컬럼). 행을 지우는 유일한 방법 */}
                <div className="flex items-start justify-center">
                  <button
                    onClick={() => setDeleteTargetId(item.id)}
                    className="p-1 text-app-text-muted hover:text-app-text opacity-0 group-hover:opacity-100 transition-opacity"
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
        <div className="flex-1 flex flex-col bg-gradient-to-br from-white via-white to-[#EDEBFF]">
          {/* 예시 행 - 실제 데이터가 아니라 형식만 안내하는 장식용.
              data 배열에 들어있지 않으므로 아이템 개수(빈 상태 판정)에 전혀 영향 없고,
              클릭/편집도 되지 않는다. */}
          <div className="grid grid-cols-[108px_144px_98px_124px_124px_150px_28px] ml-2 gap-0 px-6 min-h-[50px] items-center py-2 select-none">
            <div className="text-sm text-gray-300">카카오</div>
            <div className="text-sm text-gray-300">백엔드 개발자</div>
            <div>
              <span className="inline-block px-3 py-1 rounded-[7px] text-xs font-medium bg-gray-100 text-gray-300">
                지원예정
              </span>
            </div>
            <div className="text-sm text-gray-300">2026.07.25</div>
            <div className="text-sm text-gray-300">2026.07.25</div>
            <div className="text-sm text-gray-300">코딩테스트 준비</div>
            <div />
          </div>

          <div className="mx-8">
            <div className="bg-gray-200 h-[0.6px]"></div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
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