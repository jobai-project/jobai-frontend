import { memo } from 'react';

interface CardItem {
  label: string;
  date: string;
  detail: string;
  time: string; 
}

interface ApplicationStatusCardProps {
  title: string;
  iconSrc: string;
  items: CardItem[];
}

function ApplicationStatusCard({
  title,
  iconSrc,
  items,
}: ApplicationStatusCardProps) {
  return (
    <div className="w-[256px] h-[256px] flex flex-col rounded-[14px] border border-[#EBECFF]/90 bg-white p-6 shadow-[0_4px_12px_rgba(124,119,255,0.08)]">
      <div className="flex items-center gap-2 mb-1">
        <img src={iconSrc} alt={title} className="w-6 h-6" />
        <h3 style={{ fontSize: '15px' }} className="font-semibold text-app-text">{title}</h3>
      </div>

      <div className="space-y-0">
        {items.map((item, index) => (
          <div key={index}>
            <div className="py-3">
              <div className="flex items-start justify-between mb-1">
                <div className="font-medium text-sm text-app-text">{item.label}</div>
                <div className="text-sm font-semibold text-app-primary">{item.date}</div>
              </div>
              <div className="flex items-start justify-between">
                <div className="text-xs text-app-text-muted">{item.detail}</div>
                <div className="flex items-center gap-1 text-xs text-app-text-muted">
                  <img src="/time-icon.png" alt={title} className="w-3 h-3" />
                  <span>{item.time}</span>
                </div>
              </div>
            </div>
            {index < items.length - 1 && <div className="border-b border-gray-200" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(ApplicationStatusCard);