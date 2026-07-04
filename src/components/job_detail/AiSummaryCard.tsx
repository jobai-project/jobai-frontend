// AI 공고 요약 카드 (spec §B). 스킬 영역 아래 ~ 원문 본문 위에 배치.
// ❓ 미확정(spec TODO): 카드 배경/보더/radius(§B-1), 아이콘–제목·제목–부제 간격(§B-2),
//    버튼 sparkle 아이콘 에셋/색(§B-3), LLM 요약 API 계약·결과 렌더 방식(§B-3).
export default function AiSummaryCard() {
  // TODO(백엔드 연동 필요): LLM 요약 API 호출 + 요약 결과 표시 위치/방식 확정
  // (본문 대체 vs 별도 영역, BE A 계약 확정 후). 지금은 stub.
  const handleSummarize = () => {
    // TODO: LLM 요약 API 연동 (spec TODO 5)
  };

  return (
    // B-1 카드 컨테이너 ✅(v0.1 확정): p20, gap16(헤더그룹↔버튼, 24→16 변경), column,
    // items-start, stretch, radius16, border 1px blue-100(#EBECFF 토큰), 홈카드이펙트 shadow.
    // radial-gradient+#FFF 는 배경 shorthand로 정확히 레이어(Tailwind bg-[..]만으론 #FFF 베이스 누락).
    <div
      className="flex w-full flex-col items-start gap-4 self-stretch rounded-2xl border border-blue-100 p-5 shadow-[0_0_15.2px_0_rgba(118,85,255,0.12)]"
      style={{
        background:
          'radial-gradient(37.08% 60.83% at 96.7% 14.54%, rgba(115,84,255,0.07) 2.34%, rgba(255,255,255,0.07) 100%), #FFF',
      }}
    >
      {/* B-2 헤더 그룹. ❓ 제목–부제 세로 간격 미확정 → 잠정 8px(spec TODO 3). */}
      <div className="flex flex-col items-start gap-2 self-stretch">
        {/* 제목행: star.svg + "AI 공고 요약". ❓ 아이콘–제목 간격 미확정 → 잠정 8px. */}
        <div className="flex items-center gap-2">
          {/* star.svg 24×24 — public 문자열 절대경로 참조(import 아님, spec §B-2). */}
          <img src="/star.svg" alt="" aria-hidden className="h-6 w-6" />
          {/* Title 3 ✅: 20/600/140%/-0.4px/#000 */}
          <h3 className="font-pretendard text-[20px] font-semibold leading-[140%] tracking-[-0.4px] text-black">
            AI 공고 요약
          </h3>
        </div>
        {/* 부제 ✅: 14/500/130%/-0.28px. gray-700 토큰=#4B5969 확인됨 → text-gray-700. */}
        <p className="font-pretendard text-[14px] font-medium leading-[130%] tracking-[-0.28px] text-gray-700">
          긴 공고 내용을 핵심만 뽑아 정리해 드려요.
        </p>
      </div>

      {/* B-3 요약하기 버튼 ✅: p12/40, gap6, stretch, radius12, bg blue-500(#4741FF 토큰). */}
      <button
        type="button"
        onClick={handleSummarize}
        className="flex items-center justify-center gap-1.5 self-stretch rounded-xl bg-blue-500 px-10 py-3 font-pretendard text-[16px] font-semibold leading-[130%] tracking-[-0.32px] text-white transition hover:opacity-90"
      >
        {/* ❓ 버튼 앞 흰색 sparkle 아이콘 에셋/색 미확인 → 확정 후 gap6 자리에 추가(spec TODO 4). */}
        요약하기
      </button>
    </div>
  );
}
