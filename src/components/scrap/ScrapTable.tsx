import { memo, useEffect, useRef, useState } from 'react';
import ScoreGauge2 from '@/components/common/ScoreGauge2';
import type { Scrap, ScrapKey, ScrapSource } from '@/types/scrap';

export type ScrapSortMode = 'deadline' | 'score';

interface ScrapTableProps {
  items: Scrap[]; // ScrapItem 폐기 — Scrap 직접 사용 (v3 §2)
  selectedKeys: Set<ScrapKey>; // Set<string>(id) 폐기
  onToggleSelect: (key: ScrapKey) => void;
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  allSelected: boolean;
  onRemove: (source: ScrapSource, sourceId: number) => void;
  onDeleteSelected: () => void; // 벌크 삭제(§1.5) — ScrapPage가 useDeleteScraps로 처리
  sortMode: ScrapSortMode;
  onSortModeChange: (mode: ScrapSortMode) => void;
  onSortToggle: () => void; // 오름차순/내림차순 방향 전환 (기존 그대로)
  onItemClick: (source: ScrapSource, sourceId: number) => void; // 행 클릭 시 상세 페이지 이동
  onMoveToApplication: (item: Scrap) => void; // "+" 클릭 시 지원 현황으로 옮기기
  activeTab: 'all' | 'ongoing' | 'deadline';
}

const EMPTY_MESSAGES: Record<string, { title: string; desc?: string }> = {
  all: { title: '스크랩된 공고가 없습니다.', desc: '관심있는 공고를 스크랩하세요.' },
  ongoing: { title: '진행 중인 공고가 없습니다.' },
  deadline: { title: '마감된 공고가 없습니다.' },
};

const SORT_MODE_LABELS: Record<ScrapSortMode, string> = {
  deadline: '마감기한순',
  score: '점수순',
};

function ScrapTable({
  items,
  selectedKeys,
  onToggleSelect,
  onSelectAll,
  allSelected,
  onRemove,
  onDeleteSelected,
  sortMode,
  onSortModeChange,
  onSortToggle,
  onItemClick,
  onMoveToApplication,
  activeTab,
}: ScrapTableProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div className="w-[1084px] h-[628px] border border-[#EBECFF]/90 rounded-2xl overflow-hidden bg-white shadow-[0_4px_12px_rgba(124,119,255,0.08)]">
      <div className="flex items-center justify-end gap-2 px-6 h-[72px] bg-white">
        {/* 정렬 기준 드롭다운 - 화살표는 왼쪽에 (오른쪽은 방향 토글 아이콘 자리) */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-1 text-[14px] text-app-text-muted hover:opacity-80 transition-opacity"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 20 20"
              className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            >
              <path
                d="m6 8 4 4 4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {SORT_MODE_LABELS[sortMode]}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 z-20 w-[140px] bg-white rounded-2xl p-2 shadow-[0_0_7.6px_rgba(90,90,90,0.2)]">
              {(['deadline', 'score'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    onSortModeChange(mode);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    sortMode === mode
                      ? 'bg-[#F5F5FF] text-app-primary font-semibold'
                      : 'text-app-text hover:bg-app-bg'
                  }`}
                >
                  {SORT_MODE_LABELS[mode]}
                  {sortMode === mode && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2.5 7L5.5 10L11.5 4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 오름차순/내림차순 방향 전환 */}
        <button
          type="button"
          onClick={onSortToggle}
          aria-label="정렬 방향 전환"
          className="flex items-center p-1 hover:opacity-80 transition-opacity"
        >
          <img src="/sort-icon.png" alt="정렬 방향" className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-[40px_2.5fr_1.2fr_1.2fr_1.2fr_36px_40px] gap-3 px-6">
        <div className="col-span-7 bg-[#EBECFF] h-px"></div>
      </div>

      <div className="grid grid-cols-[40px_2.5fr_1.2fr_1.2fr_1.2fr_36px_70px] items-center gap-3 px-6 h-[77px] bg-app-bg font-medium text-[16px] text-app-text">
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
        <div />
        <button
          type="button"
          onClick={onDeleteSelected}
          disabled={selectedKeys.size === 0}
          className="text-xs font-semibold text-app-primary border border-app-primary/30 px-3 py-1.5 rounded-lg hover:bg-app-primary/10 disabled:opacity-40 transition-colors whitespace-nowrap"
        >
          선택 삭제
        </button>
      </div>

      <div className="grid grid-cols-[40px_2.5fr_1.2fr_1.2fr_1.2fr_36px_40px] gap-3 px-6">
        <div className="col-span-7 bg-[#EBECFF] h-px"></div>
      </div>

      {items.length > 0 ? (
        items.map((item) => (
          <div key={item.key}>
            <div
              onClick={() => onItemClick(item.source, item.sourceId)}
              className="h-[91px] grid grid-cols-[40px_2.5fr_1.2fr_1.2fr_1.2fr_36px_70px] gap-3 px-6 items-center hover:bg-app-bg transition-colors cursor-pointer"
            >
              {/* 체크박스 클릭이 행 클릭(상세 이동)으로 번지지 않도록 stopPropagation */}
              <div
                className="flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={selectedKeys.has(item.key)}
                  onChange={() => onToggleSelect(item.key)}
                  className="w-6 h-6 cursor-pointer border-gray-400 text-app-primary"
                />
              </div>

              <div className="min-w-0 ms-5">
                <div className="font-semibold text-app-text text-[16px] truncate mb-[6px]">
                  {item.title}
                </div>
                <div className="text-[14px] text-gray-600">{item.companyName}</div>
              </div>

              <div className="text-[14px] text-app-text text-center">{item.employmentType}</div>

              {/* 마감 기한: S1이 deadline(날짜) 제공(v5). null이면 상시. dday는 탭/정렬 전용 */}
              <div className="text-[14px] text-app-text text-center">{item.deadline ?? '상시'}</div>

              <div className="flex items-center justify-center">
                <div className="transform scale-[0.7] origin-center">
                  <ScoreGauge2 score={item.matchScore} />
                </div>
              </div>

              {/* 지원 현황으로 옮기기 - 점수 칸과 완전히 분리된 전용 칸이라 X와 안 겹침 */}
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // 행 클릭(상세 이동)으로 번지지 않게
                    onMoveToApplication(item);
                  }}
                  title="지원 현황으로 옮기기"
                  className="flex items-center justify-center w-6 h-6 rounded-full border border-app-primary/30 text-app-primary hover:bg-app-primary/10 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* 제거 버튼 클릭도 행 클릭(상세 이동)으로 번지지 않도록 stopPropagation */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item.source, item.sourceId);
                }}
                className="flex items-center justify-self-end w-7 h-7 hover:bg-app-hover rounded transition-colors"
                aria-label="제거"
              >
                <img src="/remove-icon.png" alt="" width="24" height="24" />
              </button>
            </div>

            <div className="grid grid-cols-[40px_2.5fr_1.2fr_1.2fr_1.2fr_36px_40px] gap-3 px-6">
              <div className="col-span-7 border-b border-gray-200"></div>
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