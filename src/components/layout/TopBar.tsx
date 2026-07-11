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

  return (
    <div className="mb-8 flex items-center gap-5">
      {/* 테두리·배경은 컨테이너가, input은 투명하게 안에서 늘어남. 아이콘은 오른쪽. */}
      <div className="flex h-12 w-full max-w-[716px] items-center gap-2 rounded-[10px] border border-app-border bg-app-surface px-6">
        <input
          type="text"
          value={value}
          onChange={handleSearchChange}
          onCompositionStart={() => {
            isComposing.current = true; // 조합 시작 → 검색 잠금
          }}
          onCompositionEnd={(e) => {
            isComposing.current = false; // 잠금 해제
            runSearch(e.currentTarget.value); // 완성값으로 검색
          }}
          placeholder="공고명, 회사명, 기술 스택으로 검색해 보세요"
          className="flex-1 bg-transparent text-sm text-app-text outline-none placeholder:text-app-text-subtle"
        />
        <img src="/A22.svg" alt="검색" className="h-5 w-5 shrink-0" />
      </div>
    </div>
  );
}
