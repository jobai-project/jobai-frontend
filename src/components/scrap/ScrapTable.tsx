import { memo } from 'react';
import ScoreGauge2 from '@/components/common/ScoreGauge2';

interface ScrapItem {
  id: string;
  title: string;
  category: string;
  type: string;
  deadline: string;
  score: number;
}

interface ScrapTableProps {
  data: ScrapItem[];
  selectedItems: string[];
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectItem: (id: string) => void;
  onRemove: (id: string) => void;
  allSelected: boolean;
  onSortToggle: () => void;
}

function ScrapTable({
  data,
  selectedItems,
  onSelectAll,
  onSelectItem,
  onRemove,
  allSelected,
  onSortToggle,
}: ScrapTableProps) {
  const handleDeleteSelected = () => {
    selectedItems.forEach((id) => onRemove(id));
  };

  return (
    <div className="border border-app-border rounded-lg overflow-hidden bg-white">
      <div className="flex items-center justify-end px-6 h-[72px] bg-white">
        <div 
          className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onSortToggle}
        >
          <span className="text-[14px] text-app-text-muted">마감기한순</span>
          <img 
            src="/sort-icon.png" 
            alt="정렬" 
            className="w-4 h-4"
          />
        </div>
      </div>

      <div className="grid grid-cols-[40px_2.5fr_1.2fr_1.2fr_1.2fr_40px] gap-3 px-6">
        <div className="col-span-6 border-b border-app-border"></div>
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
          onClick={handleDeleteSelected}
          disabled={selectedItems.length === 0}
          className="text-xs font-semibold text-app-primary border border-app-primary/30 px-3 py-1.5 rounded-lg hover:bg-app-primary/10 disabled:opacity-40 transition-colors whitespace-nowrap"
        >
          선택 삭제
        </button>
      </div>

      <div className="grid grid-cols-[40px_2.5fr_1.2fr_1.2fr_1.2fr_40px] gap-3 px-6">
        <div className="col-span-6 border-b border-app-border"></div>
      </div>

      {data.length > 0 ? (
        data.map((item) => (
          <div key={item.id}>
            <div className="h-[91px] grid grid-cols-[40px_2.5fr_1.2fr_1.2fr_1.2fr_70px] gap-3 px-6 items-center hover:bg-app-bg transition-colors" >
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => onSelectItem(item.id)}
                  className="w-6 h-6 cursor-pointer border-gray-400 text-app-primary"
                />
              </div>

              <div className="min-w-0 ms-5">
                {/* onClick={() => navigate('/scrap')} */}
                <div className="font-semibold text-app-text text-[18px] truncate mb-1"> 
                  {item.title}
                </div>
                <div className="text-[14px] text-gray-600">{item.category}</div>
              </div>

              <div className="text-[16px] text-app-text text-center">{item.type}</div>

              <div className="text-[16px] text-app-text text-center">{item.deadline}</div>

              <div className="flex items-center justify-center">
                <div className="transform scale-[0.7] origin-center"> 
                  <ScoreGauge2 score={item.score} />
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="flex items-center justify-self-end w-7 h-7 hover:bg-app-hover rounded transition-colors"
                aria-label="제거"
              >
                <img 
                  src="/remove-icon.png"
                  alt="" 
                  width="24" 
                  height="24" 
                />
              </button>
            </div>
            
            <div className="grid grid-cols-[40px_2.5fr_1.2fr_1.2fr_1.2fr_40px] gap-3 px-6">
              <div className="col-span-6 border-b border-app-border"></div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12 text-app-text-muted">
          <div className="text-lg font-semibold mb-2">스크랩한 공고가 없습니다</div>
          <div className="text-sm">관심 있는 공고를 스크랩해보세요</div>
        </div>
      )}
    </div>
  );
}

export default memo(ScrapTable);
