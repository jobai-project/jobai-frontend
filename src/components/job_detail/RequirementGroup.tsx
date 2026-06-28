import type { RequirementGroup as Group } from '@/types/requirement';
import RequirementRow from './RequirementRow';

export default function RequirementGroup({ group }: { group: Group }) {
  return (
    <div className="flex gap-8">
      {/* 좌측 그룹 라벨 (pt-4로 카드 첫 줄 제목에 정렬) */}
      <div className="w-20 shrink-0 pt-4 text-base font-bold text-app-text">
        {group.label}
      </div>
      {/* 우측 행 목록: 컬럼을 624px로 고정하고 카드는 w-full로 채운다 */}
      <div className="flex w-[624px] flex-col gap-3">
        {group.items.map((item) => (
          <RequirementRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
