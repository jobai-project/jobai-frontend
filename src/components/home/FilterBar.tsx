import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { COMPANY_FILTER_OPTIONS, type CompanyFilter } from '@/types/job';
import { REGION_OPTIONS, EMPLOYMENT_OPTIONS } from '@/pages/Onboarding/types';

// 드롭다운 chevron (size-20, §4-4)
function CaretIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={'h-5 w-5 transition-transform ' + (open ? 'rotate-180' : '')}
    >
      <path fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="m6 8 4 4 4-4" />
    </svg>
  );
}

// 초기화 아이콘 (size-24, §4-5)
function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 9a7.5 7.5 0 1 1-.6 4M4.5 4.5V9H9"
      />
    </svg>
  );
}

// 내 조건 적용 target 아이콘 (size-24, §4-5)
function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

const COMPANY_LABEL: Record<CompanyFilter, string> = {
  ALL: '전체',
  PRIVATE: '사기업',
  PUBLIC: '공기업',
};

interface FilterBarProps {
  // 게스트 여부 — '내 조건 적용' 클릭 시 /login 유도 (§9-4).
  guest?: boolean;
}

export default function FilterBar({ guest = false }: FilterBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 기업형태(단일) / 지역·고용형태(다중) — 쿼리스트링에서 읽어 BE 필터로 전달(§9-3).
  const rawCompany = searchParams.get('companyType');
  const company: CompanyFilter =
    rawCompany === 'PRIVATE' || rawCompany === 'PUBLIC' ? rawCompany : 'ALL';
  const locations = searchParams.getAll('location');
  const employmentTypes = searchParams.getAll('employmentType');

  const companyActive = company !== 'ALL';

  useEffect(() => {
    if (!openKey) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpenKey(null);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [openKey]);

  const toggle = (key: string) => setOpenKey((prev) => (prev === key ? null : key));

  const selectCompany = (value: CompanyFilter) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'ALL') next.delete('companyType');
    else next.set('companyType', value);
    setSearchParams(next, { replace: true });
    setOpenKey(null);
  };

  // 다중 선택 토글 (지역/고용형태). 반복형 쿼리키(location=A&location=B)로 직렬화.
  const toggleMulti = (key: string, value: string, selected: string[]) => {
    const nextValues = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    nextValues.forEach((v) => next.append(key, v));
    setSearchParams(next, { replace: true });
  };

  const reset = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('companyType');
    next.delete('location');
    next.delete('employmentType');
    setSearchParams(next, { replace: true });
    setOpenKey(null);
  };

  const applyMyConditions = () => {
    // 게스트: 조건이 없으므로 로그인 유도(§9-4).
    // TODO(회원): 회원 홈에서 온보딩 조건을 필터로 반영하는 동작 연동.
    if (guest) navigate('/login');
  };

  const regionLabel = locations.length ? `지역 ${locations.length}` : '지역';
  const employmentLabel = employmentTypes.length
    ? `고용형태 ${employmentTypes.length}`
    : '고용형태';

  return (
    // 4-3 필터 행 — justify-between
    <div ref={containerRef} className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* 기업형태 (단일) */}
        <Chip label={company === 'ALL' ? '기업형태' : COMPANY_LABEL[company]} active={companyActive} open={openKey === 'company'} onClick={() => toggle('company')}>
          <ul className="py-1">
            {COMPANY_FILTER_OPTIONS.map(({ value, label }) => (
              <li key={value}>
                <button
                  type="button"
                  onClick={() => selectCompany(value)}
                  className={
                    'w-full px-3 py-2 text-left text-[13px] transition-colors hover:bg-app-hover ' +
                    (company === value ? 'font-semibold text-app-text' : 'text-app-text-muted')
                  }
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </Chip>

        {/* 지역 (다중) */}
        <Chip label={regionLabel} active={locations.length > 0} open={openKey === 'region'} onClick={() => toggle('region')}>
          <ul className="grid max-h-[240px] grid-cols-2 gap-x-2 gap-y-1 overflow-y-auto p-2">
            {REGION_OPTIONS.map((region) => (
              <li key={region}>
                <CheckRow
                  label={region}
                  checked={locations.includes(region)}
                  onClick={() => toggleMulti('location', region, locations)}
                />
              </li>
            ))}
          </ul>
        </Chip>

        {/* 고용형태 (다중) */}
        <Chip label={employmentLabel} active={employmentTypes.length > 0} open={openKey === 'employment'} onClick={() => toggle('employment')}>
          <ul className="py-1">
            {EMPLOYMENT_OPTIONS.map(({ value, label }) => (
              <li key={value}>
                <CheckRow
                  label={label}
                  checked={employmentTypes.includes(value)}
                  onClick={() => toggleMulti('employmentType', value, employmentTypes)}
                />
              </li>
            ))}
          </ul>
        </Chip>
      </div>

      {/* 4-5 우측 액션 — 내 조건 적용 + 구분선 + 초기화 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={applyMyConditions}
          className="flex items-center gap-1 text-[14px] text-app-text-muted transition-colors hover:text-app-text"
        >
          <TargetIcon />
          내 조건 적용
        </button>
        <span aria-hidden="true" className="h-[18px] w-px bg-gray-200" />
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1 text-[14px] text-gray-500 transition-colors hover:text-app-text"
        >
          <ResetIcon />
          초기화
        </button>
      </div>
    </div>
  );
}

// 체크박스 행 (다중 드롭다운 공용)
function CheckRow({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-app-hover ' +
        (checked ? 'font-semibold text-blue-500' : 'text-app-text-muted')
      }
    >
      <span
        className={
          'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[3px] border ' +
          (checked ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300')
        }
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
            <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="m2.5 6 2.5 2.5 4.5-5" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

interface ChipProps {
  label: string;
  active: boolean;
  open: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

// 4-4 Chip — pl-16 pr-8 py-8, rounded-[23px], gap-4, border-gray-200, 라벨 14 Medium gray-700.
// 활성(선택) 상태 = 연보라 근사(bg-blue-50 border-blue-500 text-blue-500), §9-5.
function Chip({ label, active, open, onClick, children }: ChipProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={
          'flex items-center gap-1 rounded-[23px] border py-2 pl-4 pr-2 text-[14px] font-medium transition-all ' +
          (active
            ? 'border-blue-500 bg-blue-50 text-blue-500'
            : 'border-gray-200 bg-white text-gray-700 hover:border-app-border-strong')
        }
      >
        {label}
        <CaretIcon open={open} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-10 mt-1.5 min-w-[160px] overflow-hidden rounded-lg border border-app-border bg-app-surface shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          {children}
        </div>
      )}
    </div>
  );
}
