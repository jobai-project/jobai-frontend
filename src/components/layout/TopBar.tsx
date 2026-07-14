import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export default function TopBar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const q = searchParams.get('q') ?? '';

  // 입력값 저장소는 URL 쿼리(q)지만, 한글 IME 조합 중에는 검색(navigate)을
  // 건너뛰므로 그 사이 표시값을 담을 local state 가 필요하다(표시 ≠ 실행 분리).
  const [value, setValue] = useState(q);
  const isComposing = useRef(false); // 조합 중 여부

  // 최근검색어 기능 제거에 따른 잔여 데이터 정리 (한시성 마이그레이션 코드).
  // 기존 사용자 브라우저에 남은 'recentSearches' 키만 1회 제거. 충분히 배포된 뒤 삭제 가능.
  useEffect(() => {
    localStorage.removeItem('recentSearches');
  }, []);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setValue(nextValue); // 값은 항상 반영 (조합 중 낱자도 화면에 보여야 함)
    if (!isComposing.current) {
      runSearch(nextValue); // 조합 중이 아닐 때만 검색 실행
    }
  };

  // 제출(Enter): 조합 중이 아닐 때만 → 검색 실행.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposing.current) {
      runSearch(value);
    }
  };

  return (
    // 2-2 검색 컨테이너: w-716, 검색바.
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
    </div>
  );
}
