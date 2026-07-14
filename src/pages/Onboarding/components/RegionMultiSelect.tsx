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
      {/* 드롭다운 트리거(A-2): 반투명 흰 배경 + 그림자, 테두리 제거. placeholder 좌측, 셰브론 우측 */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 self-stretch rounded-[12px] bg-white/70 p-[12px] text-left shadow-[0_0_15.2px_rgba(158,158,158,0.2)]"
      >
        <span
          className={`flex-1 font-pretendard text-[16px] ${
            selected.length ? 'text-[#303D4C]' : 'text-[#AFB8C2]'
          }`}
        >
          {/* 선택 상태 문구는 다중선택 UX상 현행 유지, 미선택 placeholder만 Figma 문구로 */}
          {selected.length ? `${selected.length}개 지역 선택됨` : '선택해주세요.'}
        </span>
        {/* 접힘 = ∨, 펼침 = rotate(180deg) → ^ */}
        <img
          src="/graycheck.svg"
          alt=""
          aria-hidden
          className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 펼침 패널(A-3): 테두리 제거 + 그림자, rounded-8, 패널 패딩 0(항목마다 px-12 py-8).
          bg-white 는 드롭다운 표면상 필요해 추가(그림자만으론 투명). */}
      {open && (
        <div className="rounded-base bg-white p-0 shadow-[0_0_15.2px_rgba(90,90,90,0.2)]">
          {/* '전체'(A-5): 구분선 제거, 일반 항목과 동일 스타일.
              ❓ TODO: '전체' 다중선택 동작(전체 토글) 확인 — 로직 현행 유지, 시각만 변경.
              ❓ TODO: Figma는 '전체'를 좌열 첫 항목으로 배치 → grid→flex 전환(B-1 지역목록 확정)과
              함께 결정, 지금은 위치 유지. */}
          <label className="flex cursor-pointer items-center gap-[10px] rounded-base px-[12px] py-[8px] font-pretendard text-[16px] font-normal text-gray-500">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="sr-only"
            />
            <CheckBox checked={allSelected} />
            전체
          </label>
          {/* ❓ TODO: 열 구성 grid→flex 전환은 B-1(지역목록/정렬 확정)과 연동 → 지금은 grid 유지 */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {REGION_OPTIONS.map((region) => {
              const checked = selected.includes(region);
              return (
                <label
                  key={region}
                  className="flex cursor-pointer items-center gap-[10px] rounded-base px-[12px] py-[8px] font-pretendard text-[16px] text-gray-500"
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
