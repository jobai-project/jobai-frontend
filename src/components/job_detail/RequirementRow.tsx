import type { RequirementItem } from '@/types/requirement';
import { getRequirementIcon, getRequirementAlt } from './requirementIcon';

export default function RequirementRow({ item }: { item: RequirementItem }) {
  return (
    <div className="flex w-full items-start justify-between rounded-xl border border-[#ECECEC] bg-white px-5 py-4">
      <div className="min-w-0">
        <p className="text-base font-medium text-app-text">{item.label}</p>
        {item.description && (
          <p className="mt-1 text-sm text-app-text-subtle">{item.description}</p>
        )}
      </div>
      <img
        src={getRequirementIcon(item.status)}
        alt={getRequirementAlt(item.status)}
        className="ml-4 h-6 w-6 shrink-0"
      />
    </div>
  );
}
