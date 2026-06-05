import { useState, useMemo } from 'react';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { mockJobs } from '@/data/mockJobs';
import ScrapTable from '@/components/scrap/ScrapTable';
import ScrapTabNavigation from '@/components/scrap/ScrapTabNavigation';

type TabType = 'all' | 'ongoing' | 'deadline';

// dday를 deadline 문자열로 변환
const formatDeadline = (dday: number): string => {
  if (dday === 0) return '오늘 마감';
  if (dday < 0) return `마감`;
  return `D-${dday}`;
};

export default function ScrapPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(true);

  // BookmarkStore에서 북마크된 ID들 가져오기
  const bookmarkedIds = useBookmarkStore((s) => s.bookmarkedIds);
  const toggle = useBookmarkStore((s) => s.toggle);

  const itemsPerPage = 5;

  // 북마크된 공고만 필터링
  const bookmarkedJobs = useMemo(() => {
    return mockJobs.filter((job) => bookmarkedIds.has(job.id));
  }, [bookmarkedIds]);

  const filteredData = useMemo(() => {
    let filtered = bookmarkedJobs.map((job) => ({
      id: job.id,
      title: job.title,
      category: job.company,
      type: job.employmentType,
      deadline: formatDeadline(job.dday),
      dday: job.dday,
      score: job.score,
    }));

    if (activeTab === 'ongoing') {
      // 진행중: dday가 양수 (남은 일자가 있음)
      filtered = filtered.filter((item) => item.dday > 0);
    } else if (activeTab === 'deadline') {
      // 마감: dday가 음수 또는 0 (마감됨)
      filtered = filtered.filter((item) => item.dday <= 0);
    }

    // 정렬
    if (sortAsc) {
      filtered.sort((a, b) => a.dday - b.dday); // 마감 임박 순
    } else {
      filtered.sort((a, b) => b.dday - a.dday); // 마감 여유 순
    }

    return filtered;
  }, [bookmarkedJobs, activeTab, sortAsc]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(paginatedData.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRemove = (id: string) => {
    // BookmarkStore에서 스크랩 해제
    toggle(id);
  };

  const handleSortToggle = () => {
    setSortAsc(!sortAsc);
  };

  return (
    <div className="pt-12">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-app-text mb-2">스크랩</h1>
        <p className="text-sm text-app-text-muted">
          관심 있는 공고를 저장하고 한눈에 확인해보세요.
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <ScrapTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="h-6" />

      {/* 테이블 */}
      <ScrapTable
        data={paginatedData}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        onRemove={handleRemove}
        allSelected={paginatedData.length > 0 && paginatedData.every((item) => selectedItems.includes(item.id))}
        onSortToggle={handleSortToggle}
      />

      {/* 페이지네이션 */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="p-2 hover:bg-app-hover disabled:opacity-50 rounded"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12L4 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded text-sm font-semibold ${
                currentPage === page
                  ? 'bg-app-primary text-white'
                  : 'text-app-text hover:bg-app-hover'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="p-2 hover:bg-app-hover disabled:opacity-50 rounded"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 12L12 8L6 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}