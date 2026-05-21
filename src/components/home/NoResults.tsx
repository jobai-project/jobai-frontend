interface NoResultsProps {
  title?: string;
  description?: string;
  query?: string;
}

export default function NoResults({ title, description, query }: NoResultsProps) {
  const resolvedTitle = title ?? '검색 결과가 없습니다';
  const resolvedDescription =
    description ??
    (query
      ? `"${query}" 에 해당하는 공고를 찾지 못했어요. 다른 키워드로 검색해 보세요.`
      : '조건에 맞는 공고를 찾지 못했어요. 다른 필터로 시도해 보세요.');

  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-app-border-strong bg-app-surface px-6 py-14 text-center text-app-text-subtle">
      <div className="mb-1 text-4xl text-app-text-subtle">⌕</div>
      <div className="text-base font-semibold text-app-text-muted">{resolvedTitle}</div>
      <div className="text-[13px] text-app-text-subtle">{resolvedDescription}</div>
    </div>
  );
}
