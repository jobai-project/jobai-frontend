import { memo } from 'react';

type TabType = 'profile' | 'notification';

interface MyPageTabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TABS = [
  { id: 'profile' as const, label: '내 정보' },
  { id: 'notification' as const, label: '알림 설정' },
];

function MyPageTabNavigation({ activeTab, onTabChange }: MyPageTabNavigationProps) {
  return (
    <div className="inline-flex gap-0 border-b border-app-border mb-8">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative px-8 py-4 font-semibold text-sm transition-colors ${
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

export default memo(MyPageTabNavigation);