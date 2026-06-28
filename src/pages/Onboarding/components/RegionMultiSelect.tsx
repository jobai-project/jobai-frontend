import { useState } from 'react';
import { REGION_OPTIONS, RegionCode } from '../types';

interface RegionMultiSelectProps {
  selected: RegionCode[];
  onChange: (next: RegionCode[]) => void;
}

export default function RegionMultiSelect({
  selected,
  onChange,
}: RegionMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const allSelected = selected.length === REGION_OPTIONS.length;

  const toggleRegion = (region: RegionCode) => {
    if (selected.includes(region)) {
      onChange(selected.filter((r) => r !== region));
    } else {
      onChange([...selected, region]);
    }
  };

  const toggleAll = () => {
    onChange(allSelected ? [] : [...REGION_OPTIONS]);
  };

  return (
    <div className="space-y-3">
      {/* 선택 칩 */}
      {selected.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {selected.map((region) => (
            <span
              key={region}
              className="inline-flex items-center gap-2 px-3 py-1 bg-app-primary text-white text-xs rounded-full"
            >
              {region}
              <button
                type="button"
                onClick={() => toggleRegion(region)}
                className="hover:opacity-80"
                aria-label={`${region} 제거`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 드롭다운 토글 */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2 border border-app-border rounded-lg text-sm text-app-text hover:bg-app-bg"
      >
        <span className={selected.length ? 'text-app-text' : 'text-app-text-muted'}>
          {selected.length ? `${selected.length}개 지역 선택됨` : '지역 선택'}
        </span>
        <span className="text-app-text-muted">{open ? '▲' : '▼'}</span>
      </button>

      {/* 체크박스 목록 (2열) */}
      {open && (
        <div className="border border-app-border rounded-lg p-4">
          <label className="flex items-center gap-2 pb-3 mb-3 border-b border-app-border text-sm font-medium text-app-text cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="accent-app-primary"
            />
            전체
          </label>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {REGION_OPTIONS.map((region) => (
              <label
                key={region}
                className="flex items-center gap-2 text-sm text-app-text cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(region)}
                  onChange={() => toggleRegion(region)}
                  className="accent-app-primary"
                />
                {region}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
