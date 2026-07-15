import { memo } from 'react';
import ScoreGauge2 from '@/components/common/ScoreGauge2';
import { formatDDay } from '@/utils/dDay';
import type { Scrap, ScrapKey, ScrapSource } from '@/types/scrap';

interface ScrapTableProps {
  items: Scrap[]; // ScrapItem 폐기 — Scrap 직접 사용 (v3 §2)
  selectedKeys: Set<ScrapKey>; // Set<string>(id) 폐기
  onToggleSelect: (key: ScrapKey) => void;
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  allSelected: boolean;
  onRemove: (source: ScrapSource, sourceId: number) => void;
  onDeleteSelected: () => void; // 벌크 삭제(§1.5) — ScrapPage가 useDeleteScraps로 처리
  onSortToggle: () => void;
  activeTab: 'all' | 'ongoing' | 'deadline';
}

const EMPTY_MESSAGES: Record<string, { title: string; desc?: string }> = {
  all: { title: '스크랩된 공고가 없습니다.', desc: '관심있는 공고를 스크랩하세요.' },
  ongoing: { title: '진행 중인 공고가 없습니다.' },
  deadline: { title: '마감된 공고가 없습니다.' },
};

function ScrapTable({
  items,
  selectedKeys,
  onToggleSelect,
  onSelectAll,
  allSelected,
  onRemove,
  onDeleteSelected,
  onSortToggle,
  activeTab,
}: ScrapTableProps) {
  return (
    <div className="w-[1084px] h-[628px] border border-[#EBECFF]/90 rounded-2xl overflow-hidden bg-white shadow-[0_4px_12px_rgba(124,119,255,0.08)]">
      <div className="flex items-center justify-end px-6 h-[72px] bg-white">
        <div
          className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onSortToggle}
        >
          <span className="text-[14px] text-app-text-muted">마감기한순</span>
          <img src="/sort-icon.png" alt="정렬" className="w-4 h-4" />
        </div>
      </div>

      <div className="grid grid-cols-[40px_2.5fr_1.2fr_1.2fr_1.2fr_40px] gap-3 px-6">
        <div className="col-span-6 bg-[#EBECFF] h-px"></div>
      </div>

      <div className="grid grid-cols-[40px_2.5fr_1.2fr_1.2fr_1.2fr_70px] items-center gap-3 px-6 h-[77px] bg-app-bg font-medium text-[16px] text-app-text">
        <div className="flex items-center justify-center h-full">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onSelectAll}
            className="w-6 h-6 cursor-pointer border-gray-500 text-app-primary"
          />
        </div>
        <div>전체 선택</div>
        <div className="text-center">모집 유형</div>
        <div className="text-center">마감 기한</div>
        <div className="text-center">적합도 점수</div>
        <button
          type="button"
          onClick={onDeleteSelected}
          disabled={selectedKeys.size === 0}
          className="text-xs font-semibold text-app-primary border border-app-primary/30 px-3 py-1.5 rounded-lg hover:bg-app-primary/10 disabled:opacity-40 transition-colors whitespace-nowrap"
        >
          선택 삭제
        </button>
      </div>

      <div className="grid grid-cols-[40px_2.5fr_1.2fr_1.2fr_1.2fr_40px] gap-3 px-6">
        <div className="col-span-6 bg-[#EBECFF] h-px"></div>
      </div>

      {items.length > 0 ? (
        items.map((item) => (
          <div key={item.key}>
            <div className="h-[91px] grid grid-cols-[40px_2.5fr_1.2fr_1.2fr_1.2fr_70px] gap-3 px-6 items-center hover:bg-app-bg transition-colors">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={selectedKeys.has(item.key)}
                  onChange={() => onToggleSelect(item.key)}
                  className="w-6 h-6 cursor-pointer border-gray-400 text-app-primary"
                />
              </div>

              <div className="min-w-0 ms-5">
                <div className="font-semibold text-app-text text-[18px] truncate mb-[6px]">
                  {item.title}
                </div>
                <div className="text-[16px] text-gray-600">{item.companyName}</div>
              </div>

              <div className="text-[16px] text-app-text text-center">{item.employmentType}</div>

              {/* 마감 기한: S1은 deadline 없음 → dDay 파생 텍스트 (§1.2). TODO(G4) 백엔드 deadline 추가 시 날짜로 원복 */}
              <div className="text-[16px] text-app-text text-center">{formatDDay(item.dDay)}</div>

              <div className="flex items-center justify-center">
                <div className="transform scale-[0.7] origin-center">
                  <ScoreGauge2 score={item.matchScore} />
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRemove(item.source, item.sourceId)}
                className="flex items-center justify-self-end w-7 h-7 hover:bg-app-hover rounded transition-colors"
                aria-label="제거"
              >
                <img src="/remove-icon.png" alt="" width="24" height="24" />
              </button>
            </div>

            <div className="grid grid-cols-[40px_2.5fr_1.2fr_1.2fr_1.2fr_40px] gap-3 px-6">
              <div className="col-span-6 border-b border-gray-200"></div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12 text-app-text-muted">
          <div className="text-lg font-semibold mb-2">{EMPTY_MESSAGES[activeTab].title}</div>
          <div className="text-sm">{EMPTY_MESSAGES[activeTab].desc}</div>
        </div>
      )}
    </div>
  );
}

export default memo(ScrapTable);
