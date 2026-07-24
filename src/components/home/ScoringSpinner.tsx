// 온보딩 직후 추천공고 스코어링 대기 스피너 (P10 문구). 스켈레톤 아님.
export default function ScoringSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-app-primary"
        role="status"
        aria-label="공고 점수 산출 중"
      />
      <p className="text-sm text-gray-500">
        공고 점수 산출 중입니다. 잠시만 기다려주세요.
      </p>
    </div>
  );
}
