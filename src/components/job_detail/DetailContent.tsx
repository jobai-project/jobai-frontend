import { memo } from 'react';
import type { Job } from '@/types/job';

interface DetailContentProps {
  job: Job;
}

function DetailContent({ job }: DetailContentProps) {
  const aiSummary = job.aiSummary ?? `
    해당 공고의 주요 내용은 다음과 같습니다.

    직무 개요
    저희는 혁신적인 프론트엔드 개발팀을 확장하고 있습니다. React와 TypeScript를 기반으로 하는 고성능의 웹 애플리케이션을 개발하는 업무입니다.

    주요 업무
    • 사용자 인터페이스 설계 및 개발
    • 컴포넌트 기반 아키텍처 구축
    • 성능 최적화 및 번들 사이즈 관리
    • 테스트 코드 작성 및 유지보수

    우대 사항
    • 오픈소스 프로젝트 경험
    • 디자인 시스템 구축 경험
    • DevOps 기초 지식
  `.trim();

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <h3 className="text-base font-bold text-app-text">공고 상세</h3>
      </div>

      <div className="rounded-lg border border-app-border bg-app-bg p-5">
        <p className="whitespace-pre-line text-sm leading-relaxed text-app-text">{aiSummary}</p>
      </div>
    </div>
  );
}

export default memo(DetailContent);