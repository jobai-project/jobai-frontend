import { useState } from 'react';
import type { JobLlmSummary } from '@/types/jobApi';

interface AiSummaryCardProps {
  summary: JobLlmSummary;
}

// 탭 정의 — key 는 JobLlmSummary 필드명.
// ❓ TODO: 탭/헤딩 문구 통일 — Figma 탭 "담당 업무" vs 섹션 헤딩/코드 필드 "주요 업무".
//         default = 코드 필드(responsibilities) 기준 "주요 업무"로 통일. 최종 문구 지민 확정 후 교체.
const TABS = [
  { key: 'techStack', label: '기술 스택' },
  { key: 'responsibilities', label: '주요 업무' },
  { key: 'qualifications', label: '자격 요건' },
  { key: 'preferredQualifications', label: '우대 사항' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// 요약 완료 상태 — 탭 바 + 구조화 섹션(§4·§5). 소개/그라디언트 카드는 없음(탭+섹션으로 대체).
export default function AiSummaryCard({ summary }: AiSummaryCardProps) {
  // 값 있는 탭만 노출(기존 '빈 배열 그룹 숨김' 규칙 유지).
  const available = TABS.filter((t) => summary[t.key].length > 0);
  const [active, setActive] = useState<TabKey>(available[0]?.key ?? 'techStack');
  const activeTab = available.find((t) => t.key === active) ?? available[0];

  if (!activeTab) return null; // 모든 그룹 비어있으면 렌더 안 함
  const items = summary[activeTab.key];

  return (
    <div className="w-full">
      {/* 4-1 탭 컨테이너 — px-40 pb-16, 하단 border blue-200(arbitrary), gap-20 */}
      {/* ❓ TODO: blue-200 토큰화 보류 → border-[#C0C5FF] arbitrary 유지 */}
      <div className="flex gap-[20px] border-b border-[#C0C5FF] px-[40px] pb-[16px]">
        {available.map((t) => {
          const on = t.key === activeTab.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              // 4-2 pill — flex-1, px-20 py-8, rounded-full, 16 Medium.
              // 활성 #EBECFF/#4741FF · 비활성 #F2F4F6/#687685 (❓ 토큰 유무 무관, arbitrary)
              className={
                'flex-1 rounded-full px-[20px] py-[8px] text-[16px] font-medium transition-colors ' +
                (on ? 'bg-[#EBECFF] text-[#4741FF]' : 'bg-[#F2F4F6] text-[#687685]')
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* §5 구조화 섹션 — 탭 전환식(선택 탭 1개 표시). ❓ 스택형(gap-40) vs 탭전환 해석 상이 →
          pill 활성/비활성 스펙 기준 '탭 전환'으로 구현. */}
      <div className="flex flex-col gap-[40px] px-[40px] pt-[24px]">
        <section className="flex flex-col gap-3">
          {/* 5 섹션 헤딩 — 20 SemiBold/1.4/-0.4px/#000 */}
          <h3 className="font-pretendard text-[20px] font-semibold leading-[1.4] tracking-[-0.4px] text-black">
            {activeTab.label}
          </h3>

          {activeTab.key === 'techStack' ? (
            // 5-1 기술 스택 칩 — bg #EBECFF, #4741FF, 14 Regular, rounded-8, px-12 py-8
            <div className="flex flex-wrap gap-2">
              {items.map((it) => (
                <span
                  key={it}
                  className="rounded-[8px] bg-[#EBECFF] px-[12px] py-[8px] text-[14px] font-normal text-[#4741FF]"
                >
                  {it}
                </span>
              ))}
            </div>
          ) : (
            // 5 본문 — 16 Regular/1.5/#000. ❓ TODO: 불릿 리스트→줄바꿈 텍스트 표현 변경은
            //          지민 확정 후. default = 현재 구조(불릿) 유지, 스타일만 맞춤.
            <ul className="flex flex-col gap-2">
              {items.map((it) => (
                <li
                  key={it}
                  className="flex gap-2 text-[16px] font-normal leading-[1.5] text-black"
                >
                  <span className="text-app-text-subtle">·</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
