import { useSearchParams } from 'react-router-dom';
import { COMPANY_FILTER_OPTIONS, type CompanyFilter, type CompanyType } from '@/types/job';

const DECORATIVE_CHIPS = ['경력', '직무', '지역', '스택', '고용형태', '최소점수'];

export default function FilterBar() {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCompanyType = searchParams.get('companyType');
  const current: CompanyFilter =
    currentCompanyType === 'PUBLIC' || currentCompanyType === 'PRIVATE'
      ? (currentCompanyType as CompanyType)
      : 'ALL';

  const handleCompanyFilterClick = (type: CompanyFilter) => {
    const next = new URLSearchParams(searchParams);
    if (type === 'ALL') {
      next.delete('companyType');
    } else {
      next.set('companyType', type);
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2.5">
      <span className="mr-1 flex items-center gap-1.5 text-[13px] text-app-text-muted">
        ⇅ 필터
      </span>

      {COMPANY_FILTER_OPTIONS.map(({ value, label }) => {
        const active = current === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => handleCompanyFilterClick(value)}
            aria-pressed={active}
            className={
              'rounded-full border px-3.5 py-1.5 text-[13px] transition-all ' +
              (active
                ? 'border-app-text bg-app-text font-medium text-white'
                : 'border-app-border bg-app-surface text-app-text-muted hover:border-app-border-strong hover:text-app-text')
            }
          >
            {label}
          </button>
        );
      })}

      <div className="mx-1 h-5 w-px bg-app-border" aria-hidden="true" />

      {DECORATIVE_CHIPS.map((label) => (
        <button
          key={label}
          type="button"
          className="rounded-full border border-app-border bg-app-surface px-3.5 py-1.5 text-[13px] text-app-text-muted transition-all hover:border-app-border-strong hover:text-app-text"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
