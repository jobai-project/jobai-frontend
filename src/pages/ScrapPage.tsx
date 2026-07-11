import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { mockJobs } from '@/data/mockJobs';
import ScrapTable from '@/components/scrap/ScrapTable';
import EmptyScrap from '@/components/common/EmptyScrap';
import ScrapTabNavigation from '@/components/scrap/ScrapTabNavigation';

type TabType = 'all' | 'ongoing' | 'deadline';

const formatDeadline = (dday: number): string => {
  if (dday === 0) return '오늘 마감';
  if (dday < 0) return `마감`;
  return `D-${dday}`;
};

export default function ScrapPage() {
  const navigate = useNavigate();
  // ScrapTabNavigation 활성화 시 setter를 다시 추가한다.
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(true);

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
      filtered = filtered.filter((item) => item.dday > 0);
    } else if (activeTab === 'deadline') {
      filtered = filtered.filter((item) => item.dday <= 0);
    }

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
    toggle(id);
  };

  const handleSortToggle = () => {
    setSortAsc(!sortAsc);
  };

  return (
    <div className="pt-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-app-text mb-2">스크랩</h1>
        <p className="text-sm text-app-text">
          관심 있는 공고를 저장하고 한눈에 확인해보세요.
        </p>
      </div>
      
      <ScrapTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
     
      <div className="h-6" />

      {bookmarkedJobs.length === 0 ? (
        <EmptyScrap onAction={() => navigate('/')} className="py-20" />
      ) : (
        <ScrapTable
          data={paginatedData}
          selectedItems={selectedItems}
          onSelectAll={handleSelectAll}
          onSelectItem={handleSelectItem}
          onRemove={handleRemove}
          allSelected={paginatedData.length > 0 && paginatedData.every((item) => selectedItems.includes(item.id))}
          onSortToggle={handleSortToggle}
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
            <img src="/arrowL-icon.png" alt="이전" className="w-16 h-16 object-contain"/>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 text-[16px] font-semibold ${
                currentPage === page
                  ? 'text-app-text'
                  : 'text-gray-300'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="flex items-center justify-center disabled:opacity-50"
          >
            <img src="/arrowR-icon.png" alt="다음" className="w-16 h-16 object-contain"/>
          </button>
        </div>
      )}
    </div>
  );
}