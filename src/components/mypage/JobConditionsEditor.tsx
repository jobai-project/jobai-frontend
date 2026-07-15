import { useState, useRef, useEffect } from 'react';

interface JobConditions {
  positions: string[]; // 지역
  locations: string[]; // 기업 형태
  experiences: string[]; // 고용 형태
}

interface JobConditionsEditorProps {
  conditions: JobConditions;
  onSave: (conditions: JobConditions) => void;
  onCancel: () => void;
}

const REGION_OPTIONS = ['전체', '서울', '경기', '인천', '대전', '충남', '충북', '세종', '제주', '울산', '전북', '전남', '광주', '경북', '경남', '강원'];
const COMPANY_TYPE_OPTIONS = ['공기업', '사기업'];
const EMPLOYMENT_TYPE_OPTIONS = ['인턴', '신입', '경력직', '계약직'];

type FieldKey = 'positions' | 'locations' | 'experiences';

export default function JobConditionsEditor({
  conditions,
  onSave,
  onCancel,
}: JobConditionsEditorProps) {
  const [temp, setTemp] = useState<JobConditions>(conditions);
  const [openField, setOpenField] = useState<FieldKey | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
            onClick={() =>
              field === 'positions' ? handleRegionClick(option) : toggleItem(field, option)
            }
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
  }: {
    field: FieldKey;
    label: string;
    options: string[];
    columns?: number;
    panelWidth: string;
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

        {/* 추가 버튼 + 드롭다운을 함께 relative로 감싸 버튼 바로 밑에 고정 */}
        <div className="relative inline-block">
          <button
            onClick={() => setOpenField(openField === field ? null : field)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-dashed border-app-border rounded-[7px] font-semibold text-xs text-gray-500 hover:bg-app-bg transition-colors"
          >
            <img src="/gray-plus-icon.png" alt="추가" className="w-3 h-3" />
            추가
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

  return (
    <div ref={wrapperRef} className="space-y-4">
      <FieldRow field="positions" label="지역" options={REGION_OPTIONS} columns={3} panelWidth="560px" />
      <FieldRow field="locations" label="기업 형태" options={COMPANY_TYPE_OPTIONS} panelWidth="200px" />
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
          onClick={() => onSave(temp)}
          className="px-4 py-2 text-sm font-semibold text-white bg-app-primary rounded-lg hover:opacity-90 transition-opacity"
        >
          저장
        </button>
      </div>
    </div>
  );
}