import { useState } from 'react';
import { REGION_OPTIONS, RegionCode } from '../types';

interface RegionMultiSelectProps {
  selected: RegionCode[];
  onChange: (next: RegionCode[]) => void;
}

// 체크박스 한 칸: 선택 시 check.svg(파란 체크), 미선택 시 회색 테두리 빈 박스.
function CheckBox({ checked }: { checked: boolean }) {
  return checked ? (
    <img src="/check.svg" alt="" aria-hidden className="h-5 w-5" />
  ) : (
    <span className="h-5 w-5 rounded-[2px] border border-[#AFB8C2]" />
  );
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

  // TODO(백엔드 연동 필요): "전체"의 인코딩 방식(단일 토큰 vs 전 지역 배열)을
  // BE A와 합의 전까지 프론트에서 전 지역 배열로 처리한다.
  const toggleAll = () => {
    onChange(allSelected ? [] : [...REGION_OPTIONS]);
  };

  return (
    <div className="flex flex-col gap-2 self-stretch">
      {/* 드롭다운 트리거: placeholder 좌측, 셰브론(graycheck.svg) 우측 */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 self-stretch rounded-lg border border-[#AFB8C2] px-3 py-2.5 text-left"
      >
        <span
          className={`flex-1 font-pretendard text-[15px] ${
            selected.length ? 'text-[#303D4C]' : 'text-[#AFB8C2]'
          }`}
        >
          {selected.length ? `${selected.length}개 지역 선택됨` : '지역을 선택해주세요'}
        </span>
        {/* 접힘 = ∨, 펼침 = rotate(180deg) → ^ */}
        <img
          src="/graycheck.svg"
          alt=""
          aria-hidden
          className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 펼침 상태 = 2열 체크박스 그리드 (전체 + 지역들) */}
      {open && (
        <div className="rounded-lg border border-[#AFB8C2] p-4">
          <label className="mb-3 flex cursor-pointer items-center gap-2 border-b border-[#AFB8C2] pb-3 font-pretendard text-[15px] font-medium text-[#303D4C]">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="sr-only"
            />
            <CheckBox checked={allSelected} />
            전체
          </label>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {REGION_OPTIONS.map((region) => {
              const checked = selected.includes(region);
              return (
                <label
                  key={region}
                  className="flex cursor-pointer items-center gap-2 font-pretendard text-[15px] text-[#303D4C]"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRegion(region)}
                    className="sr-only"
                  />
                  <CheckBox checked={checked} />
                  {region}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
