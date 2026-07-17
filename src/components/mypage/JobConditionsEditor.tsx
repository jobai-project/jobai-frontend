import { useState, useRef, useEffect } from 'react';

interface JobConditions {
  positions: string[]; // 지역
  jobCategories: string[]; // 희망 직무 (단일 선택)
  experiences: string[]; // 고용 형태 (복수 선택)
}

interface JobConditionsEditorProps {
  conditions: JobConditions;
  onSave: (conditions: JobConditions) => void;
  onCancel: () => void;
}

const REGION_OPTIONS = ['전체', '서울', '경기', '인천', '대전', '충남', '충북', '세종', '제주', '울산', '전북', '전남', '광주', '경북', '경남', '강원'];
const JOB_CATEGORY_OPTIONS = ['개발자', '디자이너', '기획자'];
const EMPLOYMENT_TYPE_OPTIONS = ['인턴', '신입', '경력직', '계약직'];

// 단일 선택 필드는 희망 직무뿐. 지역·고용형태는 복수 선택.
const SINGLE_SELECT_FIELDS: FieldKey[] = ['jobCategories'];

type FieldKey = 'positions' | 'jobCategories' | 'experiences';

export default function JobConditionsEditor({
  conditions,
  onSave,
  onCancel,
}: JobConditionsEditorProps) {
  const [temp, setTemp] = useState<JobConditions>(conditions);
  const [openField, setOpenField] = useState<FieldKey | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2000);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpenField(null);
      }
    };
    if (openField) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openField]);

  const removeItem = (field: FieldKey, item: string) => {
    setTemp((prev) => ({
      ...prev,
      [field]: prev[field].filter((i) => i !== item),
    }));
  };

  const toggleItem = (field: FieldKey, item: string) => {
    setTemp((prev) => {
      const exists = prev[field].includes(item);
      return {
        ...prev,
        [field]: exists
          ? prev[field].filter((i) => i !== item)
          : [...prev[field], item],
      };
    });
  };

  // 단일 선택 필드(희망 직무) 전용 - 기존 선택을 지우고 하나로 교체
  const selectSingle = (field: FieldKey, option: string) => {
    setTemp((prev) => ({ ...prev, [field]: [option] }));
  };

  const ALL_REGIONS = REGION_OPTIONS.filter((r) => r !== '전체');

  const isAllRegionsSelected = ALL_REGIONS.every((r) => temp.positions.includes(r));

  const handleRegionClick = (region: string) => {
    if (region === '전체') {
      setTemp((prev) => ({
        ...prev,
        positions: isAllRegionsSelected ? [] : [...ALL_REGIONS],
      }));
      return;
    }
    toggleItem('positions', region);
  };

  const isOptionSelected = (field: FieldKey, option: string) => {
    if (field === 'positions' && option === '전체') {
      return isAllRegionsSelected;
    }
    return temp[field].includes(option);
  };

  const handleOptionClick = (field: FieldKey, option: string) => {
    if (field === 'positions') {
      handleRegionClick(option);
    } else if (SINGLE_SELECT_FIELDS.includes(field)) {
      selectSingle(field, option);
    } else {
      // 고용 형태(experiences) 등 복수 선택 필드는 토글(추가/제거)
      toggleItem(field, option);
    }
  };

  const OptionList = ({
    field,
    options,
    columns = 1,
  }: {
    field: FieldKey;
    options: string[];
    columns?: number;
  }) => (
    <div
      className={`grid gap-x-8 gap-y-1 ${columns === 3 ? 'grid-cols-3' : 'grid-cols-1'}`}
    >
      {options.map((option) => {
        const selected = isOptionSelected(field, option);
        return (
          <button
            key={option}
            onClick={() => handleOptionClick(field, option)}
            className={`h-[45px] flex items-center justify-between text-sm px-2 py-1 rounded-md ${
              selected ? 'bg-[#F5F5FF] text-app-primary font-semibold' : 'text-app-text'
            }`}
          >
            {option}
            <span className={selected ? 'text-app-primary' : 'text-gray-300'}>✓</span>
          </button>
        );
      })}
    </div>
  );

  const FieldRow = ({
    field,
    label,
    options,
    columns,
    panelWidth,
    addButtonLabel = '추가',
  }: {
    field: FieldKey;
    label: string;
    options: string[];
    columns?: number;
    panelWidth: string;
    addButtonLabel?: string;
  }) => (
    <div className="flex items-center gap-3">
      <div className="text-sm text-gray-400 min-w-12">{label}</div>
      <div className="flex gap-2 flex-wrap items-center">
        {field === 'positions' && isAllRegionsSelected ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F5F5FF] text-app-primary font-semibold text-xs rounded-[7px]">
            전체
            <button
              onClick={() => setTemp((prev) => ({ ...prev, positions: [] }))}
              className="hover:opacity-70"
            >
              <img src="/blue-delete-icon.png" alt="삭제" className="w-2 h-2" />
            </button>
          </span>
        ) : (
          temp[field].map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F5F5FF] text-app-primary font-semibold text-xs rounded-[7px]"
            >
              {item}
              <button
                onClick={() => removeItem(field, item)}
                className="hover:opacity-70"
              >
                <img src="/blue-delete-icon.png" alt="삭제" className="w-2 h-2" />
              </button>
            </span>
          ))
        )}

        {/* 추가/변경 버튼 + 드롭다운을 함께 relative로 감싸 버튼 바로 밑에 고정 */}
        <div className="relative inline-block">
          <button
            onClick={() => setOpenField(openField === field ? null : field)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-dashed border-app-border rounded-[7px] font-semibold text-xs text-gray-500 hover:bg-app-bg transition-colors"
          >
            <img src="/gray-plus-icon.png" alt={addButtonLabel} className="w-3 h-3" />
            {addButtonLabel}
          </button>

          {openField === field && (
            <div
              className="absolute z-50 top-full left-0 mt-2 bg-white rounded-2xl p-6 shadow-xl"
              style={{ width: panelWidth }}
            >
              <OptionList field={field} options={options} columns={columns} />
              <div className="border-t border-gray-200 mt-3 pt-3 flex justify-end">
                <button
                  onClick={() => setOpenField(null)}
                  className="px-4 py-2 text-sm text-white bg-app-primary rounded-[12px] hover:opacity-90 transition-opacity"
                >
                  적용하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const handleSave = () => {
    if (temp.jobCategories.length === 0) {
      showToast('희망 직무를 선택해주세요');
      return;
    }
    if (temp.experiences.length === 0) {
      showToast('고용 형태를 선택해주세요');
      return;
    }
    onSave(temp);
  };

  return (
    <div ref={wrapperRef} className="space-y-4 relative">
      <FieldRow field="positions" label="지역" options={REGION_OPTIONS} columns={3} panelWidth="560px" />
      <FieldRow
        field="jobCategories"
        label="희망 직무"
        options={JOB_CATEGORY_OPTIONS}
        panelWidth="200px"
        addButtonLabel="변경"
      />
      <FieldRow field="experiences" label="고용 형태" options={EMPLOYMENT_TYPE_OPTIONS} panelWidth="200px" />

      {/* 하단 취소/저장 */}
      <div className="border-t border-gray-200 mt-5 mb-4" />
      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold text-app-text-muted bg-app-bg border border-app-border rounded-lg hover:bg-app-hover transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-semibold text-white bg-app-primary rounded-lg hover:opacity-90 transition-opacity"
        >
          저장
        </button>
      </div>

      {/* 필수 선택 안내 토스트 */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
}