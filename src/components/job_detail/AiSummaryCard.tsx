import { useEffect, useMemo, useRef, useState } from 'react';
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

// sticky 탭(top-52) 높이 보정값. 섹션 scroll-mt 및 Observer rootMargin 상단에 공통 사용.
// ❓ 브라우저 실측 후 조정(명세 §5·§6-5/6-8).
const STICKY_OFFSET = 68;

// 요약 완료 상태 — sticky 탭 네비 + 4개 섹션 전체 세로 나열(명세 Phase 2).
// 탭 클릭 → 해당 섹션 smooth 스크롤. 스크롤 위치로 활성 탭 자동 하이라이트.
export default function AiSummaryCard({ summary }: AiSummaryCardProps) {
  // 값 있는 탭만 노출(기존 '빈 배열 그룹 숨김' 규칙 유지). useMemo 로 참조 안정화(Observer deps).
  const available = useMemo(
    () => TABS.filter((t) => summary[t.key].length > 0),
    [summary],
  );
  // active = "무엇을 렌더할지"가 아니라 "어느 탭을 하이라이트할지"(명세 3-2).
  const [active, setActive] = useState<TabKey>(available[0]?.key ?? 'techStack');

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const suppressObserver = useRef(false); // 클릭 스크롤 중 Observer 잠금(명세 3-6)
  const suppressTimer = useRef<number>(0);

  // 스크롤 위치 기반 활성 탭 하이라이트.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (suppressObserver.current) return; // 클릭 스크롤 중엔 무시(깜빡임 방지)
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          const key = visible.target.id.replace('summary-section-', '') as TabKey;
          setActive(key);
        }
      },
      { rootMargin: `-${STICKY_OFFSET}px 0px -60% 0px`, threshold: 0 },
    );
    available.forEach((tab) => {
      const el = sectionRefs.current[tab.key];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [available]);

  // 언마운트 시 잔여 타이머 정리.
  useEffect(() => () => window.clearTimeout(suppressTimer.current), []);

  const handleTabClick = (key: TabKey) => {
    setActive(key); // 즉시 하이라이트
    suppressObserver.current = true; // 스크롤 도중 Observer 오작동 방지
    document
      .getElementById(`summary-section-${key}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.clearTimeout(suppressTimer.current);
    suppressTimer.current = window.setTimeout(() => {
      suppressObserver.current = false; // 스크롤 도착 후 재개
    }, 600);
  };

  if (available.length === 0) return null; // 모든 그룹 비어있으면 렌더 안 함

  return (
    <div className="w-full">
      {/* 4-1 탭 줄 — sticky top-52(점수 카드와 동일 라인). bg 필수(본문 비침 방지), z-1(본문 위). */}
      <div className="sticky top-[52px] z-[1] flex items-center gap-[20px] border-b border-[#C0C5FF] bg-[#F9FAFB] px-[40px] pb-[16px]">
        {available.map((t) => {
          const on = t.key === active;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => handleTabClick(t.key)}
              // pill — flex-1, px-20 py-8, rounded-full, 16 Medium/-0.32px.
              // 활성 #EBECFF/#4741FF · 비활성 #F2F4F6/#687685
              className={
                'flex-1 rounded-full px-[20px] py-[8px] text-[16px] font-medium tracking-[-0.32px] transition-colors ' +
                (on ? 'bg-[#EBECFF] text-[#4741FF]' : 'bg-[#F2F4F6] text-[#687685]')
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* 섹션 전체 나열 — gap-40. 각 섹션은 스크롤 타겟(id) + Observer 타겟(ref) + scroll-mt. */}
      <div className="flex flex-col gap-[40px] px-[40px] pt-[24px]">
        {available.map((tab) => (
          <section
            key={tab.key}
            id={`summary-section-${tab.key}`}
            ref={(el) => {
              sectionRefs.current[tab.key] = el;
            }}
            className="flex flex-col gap-[20px]"
            style={{ scrollMarginTop: STICKY_OFFSET }}
          >
            {/* 섹션 헤딩 — 20 SemiBold/1.4/-0.4px/#000 */}
            <h3 className="font-pretendard text-[20px] font-semibold leading-[1.4] tracking-[-0.4px] text-black">
              {tab.label}
            </h3>

            {tab.key === 'techStack' ? (
              // 기술 스택 칩 — bg #EBECFF, #4741FF, 14 Regular/-0.28px, rounded-8, px-12 py-8
              <div className="flex flex-wrap gap-[8px]">
                {summary[tab.key].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-[8px] bg-[#EBECFF] px-[12px] py-[8px] text-[14px] font-normal tracking-[-0.28px] text-[#4741FF]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            ) : (
              // 본문 단락 — 16 Regular/1.5/-0.32px/#000. 데이터에 '•' 포함 → 코드에서 추가 금지(중복 방지).
              <p className="whitespace-pre-wrap text-[16px] font-normal leading-[1.5] tracking-[-0.32px] text-black">
                {summary[tab.key].join('\n')}
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
