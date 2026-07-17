import { memo } from 'react';
import { decodeAndSanitize } from '@/utils/sanitizeHtml';

interface DetailContentProps {
  content: string; // private description / public htmlContent (원문 본문)
}

function DetailContent({ content }: DetailContentProps) {
  // private/public 둘 다 HTML(이스케이프 또는 생) → 디코드 + sanitize 후 렌더 (결정 사항).
  const html = decodeAndSanitize(content);

  // P6: Figma 1428:14197 — 헤딩·테두리 박스 제거. 평문 16 Regular #000, px-20.
  // ❓ TODO(P6): Figma 본문 폭 756 > 좌컬럼 716 모순 → w-full 유지, 확정 대기.
  return html ? (
    <div
      className="w-full px-[20px] text-[16px] leading-[1.5] text-black [&_a]:text-app-primary [&_a]:underline [&_li]:ml-4 [&_li]:list-disc [&_ul]:pl-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : (
    <div className="w-full px-[20px] text-sm text-app-text-muted">
      상세 내용이 없습니다.
    </div>
  );
}

export default memo(DetailContent);
