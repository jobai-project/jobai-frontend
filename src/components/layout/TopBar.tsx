import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

// 최근검색 로컬 저장 사양(§Phase2 1-3): key 'recentSearches', string[], 최대 10,
// 중복 제거(대소문자 무시), 최신순. 저장은 '제출(Enter/클릭)' 시에만.
const RECENT_KEY = 'recentSearches';
const RECENT_MAX = 10;

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export default function TopBar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const q = searchParams.get('q') ?? '';

  // 입력값 저장소는 URL 쿼리(q)지만, 한글 IME 조합 중에는 검색(navigate)을
  // 건너뛰므로 그 사이 표시값을 담을 local state 가 필요하다(표시 ≠ 실행 분리).
  const [value, setValue] = useState(q);
  const isComposing = useRef(false); // 조합 중 여부
  const [recent, setRecent] = useState<string[]>(() => loadRecent());

  // 뒤로가기·링크 등 외부 요인으로 URL 의 q 가 바뀌면 입력값을 동기화한다.
  // (직접 타이핑 시엔 runSearch → q 가 곧 value 와 같아지므로 루프 없음)
  useEffect(() => {
    setValue(q);
  }, [q]);

  // 실제 검색 실행 = URL 쿼리 갱신 → HomePage 가 q 로 필터/refetch.
  const runSearch = (next: string) => {
    const params = new URLSearchParams(searchParams);
    if (next) params.set('q', next);
    else params.delete('q');

    const target = { pathname: '/', search: params.toString() };
    const stayingOnHome = location.pathname === '/';
    navigate(target, { replace: stayingOnHome });
  };

  // 최근검색 저장(§1-3): 제출 시에만 호출. 최신순·중복제거(대소문자 무시)·최대 10.
  const pushRecent = (term: string) => {
    const t = term.trim();
    if (!t) return;
    setRecent((prev) => {
      const next = [t, ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(
        0,
        RECENT_MAX,
      );
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setValue(nextValue); // 값은 항상 반영 (조합 중 낱자도 화면에 보여야 함)
    if (!isComposing.current) {
      runSearch(nextValue); // 조합 중이 아닐 때만 검색 실행
    }
  };

  // 제출(Enter): 조합 중이 아닐 때만 → 검색 실행 + 최근검색 저장.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposing.current) {
      runSearch(value);
      pushRecent(value);
    }
  };

  // 최근검색 클릭 → 해당 키워드로 재검색 + 최신순 갱신.
  const handleRecentClick = (term: string) => {
    setValue(term);
    runSearch(term);
    pushRecent(term);
  };

  return (
    // 2-2 검색 컨테이너: w-716, 검색바 + 최근검색 세로 스택(gap-16).
    <div className="mb-8 flex w-full max-w-[716px] flex-col gap-4">
      {/* 2-3 검색바: px-24 py-12, rounded-full, border-gray-100. 아이콘은 우측. */}
      <div className="flex items-center gap-2 rounded-full border border-gray-100 bg-app-surface px-6 py-3">
        <input
          type="text"
          value={value}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => {
            isComposing.current = true; // 조합 시작 → 검색 잠금
          }}
          onCompositionEnd={(e) => {
            isComposing.current = false; // 잠금 해제
            runSearch(e.currentTarget.value); // 완성값으로 검색
          }}
          placeholder="공고명, 회사명, 기술 스택으로 검색해 보세요"
          // 2-4 placeholder: gray-400, tracking -0.28px
          className="flex-1 bg-transparent text-sm tracking-[-0.28px] text-app-text outline-none placeholder:text-gray-400"
        />
        {/* 2-5 검색 아이콘 size-24 */}
        <img src="/A22.svg" alt="검색" className="h-6 w-6 shrink-0" />
      </div>

      {/* 2-6~2-8 최근검색 행: px-24, gap-8, items-end. 순번+키워드(16 Medium gray-700).
          ※ localStorage 는 검색어 문자열만 보관하므로 프레임의 보조 텍스트(회사명 14/gray-500)는
             데이터 소스가 없어 생략(인기검색 API 도입 시 확장). */}
      {recent.length > 0 && (
        <div className="flex flex-wrap items-end gap-2 px-6">
          {recent.map((term, i) => (
            <button
              key={term}
              type="button"
              onClick={() => handleRecentClick(term)}
              className="flex items-end gap-2 text-left transition hover:opacity-80"
            >
              <span className="text-[16px] font-medium leading-[1.5] tracking-[-0.32px] text-gray-700">
                {i + 1}
              </span>
              <span className="text-[16px] font-medium leading-[1.5] tracking-[-0.32px] text-gray-700">
                {term}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
