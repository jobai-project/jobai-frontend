import { Link } from 'react-router-dom';

// Footer (Figma 1405:16265) — 기본형: '더 불러오기' 버튼 미포함(§5-2 default, 앱은 자동 무한스크롤).
// 컨테이너 패딩: 부모 MainLayout <main className="p-[40px]">(MainLayout.tsx:17)이 좌우 40px를 이미
// 제공하므로 px 생략, py-[32px]만 적용(§5-4).
export default function Footer() {
  return (
    <footer className="flex w-full flex-col items-center justify-center py-[32px]">
      {/* 하단 블록 (1405:16268) — flex-col gap-16, 폭 full */}
      <div className="flex w-full flex-col gap-[16px]">
        {/* 구분선 (1405:16269) — 0.7px(≈1px) gray-200 */}
        <div className="w-full border-t border-gray-200" />

        {/* 내용 행 (1405:16270) — justify-between */}
        <div className="flex w-full items-center justify-between">
          {/* 좌측 (1405:16271) — 로고 + 저작권, gap-12 */}
          <div className="flex items-center gap-[12px]">
            {/* 로고 (1405:16272) — 57×16.4. logo.png 종횡비(3327×957≈3.476)가 실측(57/16.4≈3.476)과
                일치 → w-[57px] h-auto 로 비율 유지. */}
            <img src="/logo.png" alt="JobA!" className="h-auto w-[57px]" />
            {/* 저작권 (1405:16279) — 13px Regular gray-400 */}
            <span className="text-[13px] leading-[1.3] tracking-[-0.26px] text-gray-400">
              © 2026 JobA! All rights reserved.
            </span>
          </div>

          {/* 우측 (1405:16280) — 메뉴, gap-16, 13px gray-700 */}
          <nav className="flex items-center gap-[16px] text-[13px] leading-[1.3] tracking-[-0.26px] text-gray-700">
            <Link to="/" className="transition-colors hover:text-app-text">
              홈
            </Link>
            <Link to="/application" className="transition-colors hover:text-app-text">
              지원 현황
            </Link>
            <Link to="/scrap" className="transition-colors hover:text-app-text">
              스크랩
            </Link>
            <Link to="/profile" className="transition-colors hover:text-app-text">
              마이페이지
            </Link>
            {/* ❓ TODO: '개인정보 처리방침' 라우트/외부링크 미정 → 확정 전까지 href="#". */}
            <a href="#" className="font-semibold leading-[1.5] transition-colors hover:text-app-text">
              개인정보 처리방침
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
