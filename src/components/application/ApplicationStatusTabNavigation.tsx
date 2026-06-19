import { memo } from 'react';

type TabType = 'all' | 'expected' | 'ongoing' | 'rejected' | 'passed';

interface ApplicationStatusTabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TABS = [
  { id: 'all', label: '전체' },
  { id: 'expected', label: '지원 예정' },
  { id: 'ongoing', label: '진행 중' },
  { id: 'rejected', label: '탈락' },
  { id: 'passed', label: '최종합격' },
];

function ApplicationStatusTabNavigation({
  activeTab,
  onTabChange,
}: ApplicationStatusTabNavigationProps) {
  return (
    <div className="inline-flex gap-0 border-b border-app-border mb-6">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id as TabType)}
          className={`relative px-6 py-4 font-semibold text-sm transition-colors ${
            activeTab === tab.id
              ? 'text-app-primary'
              : 'text-app-text-muted hover:text-app-text'
          }`}
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

export default memo(ApplicationStatusTabNavigation);