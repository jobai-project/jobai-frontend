import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScraps, useToggleScrap, useDeleteScraps } from '@/hooks/useScraps';
import ScrapTable from '@/components/scrap/ScrapTable';
import type { ScrapSortMode } from '@/components/scrap/ScrapTable';
import EmptyScrap from '@/components/common/EmptyScrap';
import ScrapTabNavigation from '@/components/scrap/ScrapTabNavigation';
import type { ScrapKey, ScrapSource } from '@/types/scrap';

type TabType = 'all' | 'ongoing' | 'deadline';

const itemsPerPage = 5;

// 정렬 키: null=상시=가장 덜 급함 → +Infinity (§1.3)
const dv = (d: number | null) => d ?? Number.POSITIVE_INFINITY;

export default function ScrapPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedKeys, setSelectedKeys] = useState<Set<ScrapKey>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(true);
  const [sortMode, setSortMode] = useState<ScrapSortMode>('deadline');

  const { data, isLoading } = useScraps();
  const toggle = useToggleScrap();
  const deleteScraps = useDeleteScraps();

  const scraps = data ?? [];

  // 탭·정렬 변경 시 1페이지로 리셋(범위 이탈 방지)
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, sortAsc, sortMode]);

  const filteredData = useMemo(() => {
    let filtered = scraps;
    // §1.4: dDay===null(상시) → 진행중, dDay===0(D-DAY) → 마감
    if (activeTab === 'ongoing') {
      filtered = filtered.filter((s) => s.dDay === null || s.dDay > 0);
    } else if (activeTab === 'deadline') {
      filtered = filtered.filter((s) => s.dDay !== null && s.dDay <= 0);
    }
    // sortMode에 따라 1차 정렬 기준을 통째로 바꾼다.
    // - deadline: 마감일 우선(동점이면 점수 높은 순)
    // - score: 점수 우선(동점이면 마감일 빠른 순)
    return [...filtered].sort((a, b) => {
      const av = dv(a.dDay);
      const bv = dv(b.dDay);
      const aScore = a.matchScore ?? -1;
      const bScore = b.matchScore ?? -1;

      if (sortMode === 'deadline') {
        if (av !== bv) return sortAsc ? av - bv : bv - av;
        return bScore - aScore; // 동점 시 높은 점수 먼저
      } else {
        if (aScore !== bScore) return sortAsc ? aScore - bScore : bScore - aScore;
        return av - bv; // 동점 시 빠른 마감일 먼저
      }
    });
  }, [scraps, activeTab, sortAsc, sortMode]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const allSelected =
    paginatedData.length > 0 && paginatedData.every((s) => selectedKeys.has(s.key));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (e.target.checked) paginatedData.forEach((s) => next.add(s.key));
      else paginatedData.forEach((s) => next.delete(s.key));
      return next;
    });
  };

  const handleToggleSelect = (key: ScrapKey) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleRemove = (source: ScrapSource, sourceId: number) => {
    toggle.mutate({ source, sourceId, scrapped: true });
  };

  const handleDeleteSelected = () => {
    if (selectedKeys.size === 0) return;
    deleteScraps.mutate(Array.from(selectedKeys));
    setSelectedKeys(new Set());
  };

  const handleSortToggle = () => setSortAsc((v) => !v);

  // 스크랩 행 클릭 시 해당 공고 상세 페이지로 이동
  const handleItemClick = (source: ScrapSource, sourceId: number) => {
    navigate(`/jobs/${source}/${sourceId}`);
  };

  if (isLoading) {
    return (
      <div className="pt-12">
        <div className="mb-7 h-8 w-40 animate-pulse rounded bg-[#F2F4F6]" />
        <div className="h-[628px] w-[1084px] animate-pulse rounded-2xl bg-[#F2F4F6]" />
      </div>
    );
  }

  return (
    <div className="pt-12">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-app-text mb-2">스크랩</h1>
        <p className="text-[16px] text-app-text">
          관심 있는 공고를 저장하고 한눈에 확인해보세요.
        </p>
      </div>

      <ScrapTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="h-6" />

      {scraps.length === 0 ? (
        <EmptyScrap onAction={() => navigate('/')} className="py-20" />
      ) : (
        <ScrapTable
          items={paginatedData}
          selectedKeys={selectedKeys}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          allSelected={allSelected}
          onRemove={handleRemove}
          onDeleteSelected={handleDeleteSelected}
          sortMode={sortMode}
          onSortModeChange={setSortMode}
          onSortToggle={handleSortToggle}
          onItemClick={handleItemClick}
          activeTab={activeTab}
        />
      )}

      {filteredData.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="flex items-center justify-center disabled:opacity-50"
          >
            <img src="/arrowL-icon.png" alt="이전" className="w-16 h-16 object-contain" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 text-[16px] font-semibold ${
                  currentPage === page ? 'text-app-text' : 'text-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="flex items-center justify-center disabled:opacity-50"
          >
            <img src="/arrowR-icon.png" alt="다음" className="w-16 h-16 object-contain" />
          </button>
        </div>
      )}
    </div>
  );
}