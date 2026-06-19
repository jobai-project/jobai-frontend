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
    <div className="border border-app-border rounded-lg pt-4 px-4 pb-1 bg-white">
      <div className="flex items-center gap-2 mb-1">
        <img src={iconSrc} alt={title} className="w-6 h-6" />
        <h3 className="font-semibold text-app-text">{title}</h3>
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
            {index < items.length - 1 && <div className="border-b border-app-border" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(ApplicationStatusCard);