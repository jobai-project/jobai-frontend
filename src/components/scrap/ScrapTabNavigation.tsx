import { memo } from 'react';

type TabType = 'all' | 'ongoing' | 'deadline';

interface ScrapTabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'all' as const, label: '전체' },
  { id: 'ongoing' as const, label: '진행중' },
  { id: 'deadline' as const, label: '마감' },
] as const;

function ScrapTabNavigation({ activeTab, onTabChange }: ScrapTabNavigationProps) {
  return (
    <div className="inline-flex border-b border-app-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`relative px-16 py-4 text-sm font-semibold transition-colors ${
            activeTab === tab.id
              ? 'text-app-primary'
              : 'text-gray-500 hover:text-app-text'
          }`}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-app-primary" />
          )}
        </button>
      ))}
    </div>
  );
}

export default memo(ScrapTabNavigation);