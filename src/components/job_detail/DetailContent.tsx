import { memo } from 'react';
import { decodeAndSanitize } from '@/utils/sanitizeHtml';

interface DetailContentProps {
  content: string; // private description / public htmlContent (원문 본문)
}

function DetailContent({ content }: DetailContentProps) {
  // private/public 둘 다 HTML(이스케이프 또는 생) → 디코드 + sanitize 후 렌더 (결정 사항).
  const html = decodeAndSanitize(content);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <h3 className="text-base font-bold text-app-text">상세 내용</h3>
      </div>

      {html ? (
        <div
          className="rounded-lg border border-app-border bg-app-bg p-5 text-[16px] leading-[1.5] text-black [&_a]:text-app-primary [&_a]:underline [&_li]:ml-4 [&_li]:list-disc [&_ul]:pl-4"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className="rounded-lg border border-app-border bg-app-bg p-5 text-sm text-app-text-muted">
          상세 내용이 없습니다.
        </div>
      )}
    </div>
  );
}

export default memo(DetailContent);
