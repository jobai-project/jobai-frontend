import { memo } from 'react';

type TabType = 'detail' | 'qualification';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'detail' as const, label: '상세내용' },
  { id: 'qualification' as const, label: '지원자격' },
] as const;

function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex border-b border-app-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`relative flex-1 px-8 py-4 text-sm font-semibold transition-colors ${
            activeTab === tab.id
              ? 'text-app-text'
              : 'text-app-text-muted hover:bg-app-hover hover:text-app-text'
          }`}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-app-primary" />
          )}
        </button>
      ))}
    </div>
  );
}

export default memo(TabNavigation);