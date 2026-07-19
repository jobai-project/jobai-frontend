import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { COMPANY_FILTER_OPTIONS } from '@/types/job';
import { EMPLOYMENT_OPTIONS } from '@/pages/Onboarding/types';
import { useMyPageInfo } from '@/hooks/useMember';

// 드롭다운 chevron (size-20)
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

// 초기화 아이콘 (size-24)
function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M4.5 9a7.5 7.5 0 1 1-.6 4M4.5 4.5V9H9" />
    </svg>
  );
}

// 기업형태 패널 옵션 — '전체' 제외, 다중(Figma 1321:12693 = 공기업/사기업만).
const COMPANY_PANEL_OPTIONS = COMPANY_FILTER_OPTIONS.filter((o) => o.value !== 'ALL');

// 지역 패널 3열×6행 열우선 순서 (Figma 1321:12562, §2.7). '전체'는 저장값이 아니라 "선택 전부 해제".
// TODO(B구역-D1): '전체' 규칙 디자이너 확정 대기. 현재 "선택 전부 해제"로 구현
//                (근거: Figma 서울·경기 선택 시 '전체' 비선택).
const REGION_PANEL_ORDER = [
  '전체', '서울', '경기', '인천', '대전', '충남',
  '충북', '세종', '제주', '부산', '대구', '울산',
  '전북', '전남', '광주', '경북', '경남', '강원',
];

// 패널 key → URL 쿼리 키. URL 키는 단수 + 반복값(현행 컨벤션 유지, companyTypes 로 바꾸지 않음).
const PANEL_URL_KEY: Record<string, string> = {
  company: 'companyType',
  region: 'location',
  employment: 'employmentType',
};

interface FilterBarProps {
  // 게스트 여부 — '내 조건 적용' 클릭 시 /login 유도.
  guest?: boolean;
}

export default function FilterBar({ guest = false }: FilterBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  // 회원 홈에서만 조회(게스트는 발화 차단) — '내 조건 적용'이 읽는 저장 조건 소스.
  const { data: myPageData } = useMyPageInfo({ enabled: !guest });
  const [openKey, setOpenKey] = useState<string | null>(null);
  // deferred-apply: 열린 패널의 임시 선택값. URL은 '적용하기' 커밋 시에만 변경(§2-1).
  const [pending, setPending] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // URL 적용값 — 칩 pill 활성 표시용(적용된 값 기준).
  const companyUrl = searchParams.getAll('companyType');
  const locationUrl = searchParams.getAll('location');
  const employmentUrl = searchParams.getAll('employmentType');

  useEffect(() => {
    if (!openKey) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpenKey(null); // 닫힘 = pending 폐기(다음 open 시 재초기화)
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [openKey]);

  // 패널 열기: pending ← URL 현재값으로 초기화(§2-1). 같은 칩 재클릭 = 닫기.
  const openPanel = (key: string) => {
    if (openKey === key) {
      setOpenKey(null);
      return;
    }
    setPending(searchParams.getAll(PANEL_URL_KEY[key]));
    setOpenKey(key);
  };

  const togglePending = (value: string) =>
    setPending((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );

  const removePending = (value: string) =>
    setPending((prev) => prev.filter((v) => v !== value));

  // 지역 '전체' = 선택 전부 해제(저장값 아님, 백엔드 미전송).
  const onRegionClick = (value: string) => {
    if (value === '전체') {
      setPending([]);
      return;
    }
    togglePending(value);
  };

  // 적용하기 → pending 커밋 → 패널 닫힘.
  // TODO(B구역-D5): 디자이너 확정 대기. 현재 "적용 후 닫힘 / 미적용 닫으면 pending 폐기(롤백)"로 구현.
  const applyPending = () => {
    if (!openKey) return;
    const urlKey = PANEL_URL_KEY[openKey];
    const next = new URLSearchParams(searchParams);
    next.delete(urlKey);
    pending.forEach((v) => next.append(urlKey, v));
    setSearchParams(next, { replace: true });
    setOpenKey(null);
  };

  // 초기화 = URL 직접 삭제(즉시 반영). 패널 밖 버튼이라 pending 대상 아님.
  // TODO(B구역-D4): 초기화가 열린 패널의 pending 도 지우는가 — 디자이너 확정 대기.
  const reset = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('companyType');
    next.delete('location');
    next.delete('employmentType');
    setSearchParams(next, { replace: true });
    setOpenKey(null);
  };

  // 회원 저장 조건(지역·고용형태)을 홈 필터(URL)에 반영. 직무·기업형태는 이번 범위 아님.
  const applyMyConditions = () => {
    // 게스트: 조건이 없으므로 로그인 유도.
    if (guest) {
      navigate('/login');
      return;
    }
    const pref = myPageData?.jobPreference;
    if (!pref) return;

    const next = new URLSearchParams(searchParams);
    // 지역 — 한글 시도명 그대로(값=URL 형식 동일). 비어 있으면 기존 값 유지(덮어쓰지 않음).
    if (pref.locations?.length) {
      next.delete('location');
      pref.locations.forEach((loc) => next.append('location', loc));
    }
    // 고용형태 — 마이페이지 한글 라벨 → 필터 코드값 변환. 매칭 없는 값은 skip.
    if (pref.careerType?.length) {
      next.delete('employmentType');
      pref.careerType.forEach((kor) => {
        const code = EMPLOYMENT_OPTIONS.find((o) => o.label === kor)?.value;
        if (code) next.append('employmentType', code);
      });
    }
    // companyType 은 소스 없음 → 손대지 않음(기존 값 유지).
    setSearchParams(next, { replace: true });
    setOpenKey(null);
  };

  const companyLabel = companyUrl.length ? `기업형태 ${companyUrl.length}` : '기업형태';
  const regionLabel = locationUrl.length ? `지역 ${locationUrl.length}` : '지역';
  const employmentLabel = employmentUrl.length
    ? `고용형태 ${employmentUrl.length}`
    : '고용형태';

  // 선택칩(select) 표시 라벨. 고용형태는 코드→라벨, 지역은 값=라벨.
  const employmentLabelOf = (v: string) =>
    EMPLOYMENT_OPTIONS.find((o) => o.value === v)?.label ?? v;

  return (
    // 4-3 필터 행 — justify-between
    <div ref={containerRef} className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* 기업형태 (다중) — 선택칩 행 없음(§2.6, Figma 그대로). TODO(B구역-D2): 의도 확인 */}
        <Chip label={companyLabel} active={companyUrl.length > 0} open={openKey === 'company'} onClick={() => openPanel('company')} panelClassName="w-[244px]">
          <div className="flex flex-col gap-[4px]">
            {COMPANY_PANEL_OPTIONS.map(({ value, label }) => (
              <CheckRow key={value} label={label} checked={pending.includes(value)} onClick={() => togglePending(value)} />
            ))}
          </div>
          <PanelFooter onApply={applyPending} />
        </Chip>

        {/* 지역 (다중, 3열×6행, '전체') */}
        <Chip label={regionLabel} active={locationUrl.length > 0} open={openKey === 'region'} onClick={() => openPanel('region')} panelClassName="w-[700px]">
          <div className="grid grid-flow-col grid-cols-3 grid-rows-6 gap-x-[16px] gap-y-[4px]">
            {REGION_PANEL_ORDER.map((region) => {
              const checked = region === '전체' ? pending.length === 0 : pending.includes(region);
              return (
                <CheckRow key={region} label={region.trim()} checked={checked} onClick={() => onRegionClick(region)} />
              );
            })}
          </div>
          <PanelFooter
            onApply={applyPending}
            chips={
              // TODO(B구역-D3): pending 0개 시 미렌더(하단 justify-end). opacity-0 자리유지 여부 디자이너 확정 대기.
              pending.length > 0
                ? pending.map((v) => (
                    <SelectChip key={v} label={v} onRemove={() => removePending(v)} />
                  ))
                : undefined
            }
          />
        </Chip>

        {/* 고용형태 (다중) */}
        <Chip label={employmentLabel} active={employmentUrl.length > 0} open={openKey === 'employment'} onClick={() => openPanel('employment')} panelClassName="w-[244px]">
          <div className="flex flex-col gap-[4px]">
            {EMPLOYMENT_OPTIONS.map(({ value, label }) => (
              <CheckRow key={value} label={label} checked={pending.includes(value)} onClick={() => togglePending(value)} />
            ))}
          </div>
          <PanelFooter
            onApply={applyPending}
            chips={
              pending.length > 0
                ? pending.map((v) => (
                    <SelectChip key={v} label={employmentLabelOf(v)} onRemove={() => removePending(v)} />
                  ))
                : undefined
            }
          />
        </Chip>
      </div>

      {/* 4-5 우측 액션 — 내 조건 적용 + 구분선 + 초기화 (현행 유지) */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={applyMyConditions}
          className="flex items-center gap-1 text-[14px] text-[#4741FF] transition-opacity hover:opacity-80"
        >
          <img src="/target-fill.svg" alt="" aria-hidden className="h-6 w-6" />
          내 조건 적용
        </button>
        <span aria-hidden="true" className="h-[18px] w-px bg-gray-200" />
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1 text-[14px] text-[#8995A2] transition-colors hover:text-app-text"
        >
          <ResetIcon />
          초기화
        </button>
      </div>
    </div>
  );
}

// 체크행 (§2.3) — 우측 체크마크(온보딩 svg 재사용), 선택 시 행 배경 #F5F5FF.
function CheckRow({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    // TODO(토큰: blue-50 미정의): 선택행 배경 #F5F5FF arbitrary 사용.
    <button
      type="button"
      onClick={onClick}
      className={
        'flex w-[212px] items-center justify-between rounded-[12px] p-[12px] text-[14px] tracking-[-0.28px] transition-colors ' +
        (checked
          ? 'bg-[#F5F5FF] font-semibold text-blue-500'
          : 'bg-white font-normal text-gray-900')
      }
    >
      <span>{label}</span>
      {/* TODO: 온보딩 에셋(onboardcheck/onboarduncheck) 재사용 중 — 필터 전용 아이콘 분리 검토 */}
      <img
        src={checked ? '/onboardcheck.svg' : '/onboarduncheck.svg'}
        alt=""
        aria-hidden
        width={20}
        height={20}
        className="shrink-0"
      />
    </button>
  );
}

// 선택 칩 (§2.5) — bg #F2F4F6, 12px #4B5969, X 9×9.
function SelectChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-[8px] rounded-[8px] bg-gray-100 px-[12px] py-[8px]">
      <span className="text-[12px] leading-[1.3] tracking-[-0.24px] text-gray-700">
        {label}
      </span>
      <button type="button" onClick={onRemove} aria-label={`${label} 제거`} className="flex shrink-0">
        <svg viewBox="0 0 9 9" className="h-[9px] w-[9px]" aria-hidden>
          <path d="M1 1l7 7M8 1l-7 7" fill="none" stroke="#4B5969" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

// 하단 행 (§2.4 구분선 + §2.5 칩/적용하기). chips 없으면 justify-end.
function PanelFooter({ chips, onApply }: { chips?: React.ReactNode; onApply: () => void }) {
  return (
    <>
      {/* Line 243 — divider (§2.4) */}
      <div className="h-px w-full bg-gray-200" />
      <div className={'flex items-center gap-[8px] ' + (chips ? 'justify-between' : 'justify-end')}>
        {chips ? (
          <div className="flex flex-wrap items-center gap-[8px]">{chips}</div>
        ) : null}
        <button
          type="button"
          onClick={onApply}
          className="shrink-0 rounded-[12px] bg-blue-500 px-[16px] py-[10px] text-[14px] font-semibold tracking-[-0.28px] text-white transition hover:opacity-90"
        >
          적용하기
        </button>
      </div>
    </>
  );
}

interface ChipProps {
  label: string;
  active: boolean;
  open: boolean;
  onClick: () => void;
  panelClassName?: string;
  children: React.ReactNode;
}

// 4-4 Chip pill + 패널 컨테이너(§2.1: bg-white p-16 rounded-20 shadow, gap-16). 위치 §2.2: chip 좌측정렬, top+2px.
function Chip({ label, active, open, onClick, panelClassName, children }: ChipProps) {
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
            ? 'border-blue-500 bg-[#F5F5FF] text-blue-500'
            : 'border-gray-200 bg-white text-gray-700 hover:border-app-border-strong')
        }
      >
        {label}
        <CaretIcon open={open} />
      </button>

      {open && (
        <div
          className={
            'absolute left-0 top-full z-20 mt-[2px] flex flex-col gap-[16px] rounded-[20px] bg-white p-[16px] drop-shadow-[0px_0px_7.6px_rgba(90,90,90,0.2)] ' +
            (panelClassName ?? '')
          }
        >
          {children}
        </div>
      )}
    </div>
  );
}
