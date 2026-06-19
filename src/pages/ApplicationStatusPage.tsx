import { useState, useMemo } from 'react';
import ApplicationStatusTabNavigation from '@/components/application/ApplicationStatusTabNavigation';
import ApplicationStatusTable from '@/components/application/ApplicationStatusTable';
import ApplicationStatusCard from '@/components/application/ApplicationStatusCard';
import ScoreGauge2 from '@/components/common/ScoreGauge2';

type TabType = 'all' | 'expected' | 'ongoing' | 'rejected' | 'passed';

interface ApplicationItem {
  id: string;
  company: string;
  position: string;
  stage: string;
  appliedDate: string;
  nextSchedule: string;
  memo: string;
}

const MOCK_DATA: ApplicationItem[] = [
  {
    id: '1',
    company: '네이버',
    position: '백엔드 개발자',
    stage: '지원해석',
    appliedDate: '2026.05.16',
    nextSchedule: '2026.05.20',
    memo: '코테 준비',
  },
  {
    id: '2',
    company: '네이버',
    position: '백엔드 개발자',
    stage: '지원완료',
    appliedDate: '2026.05.16',
    nextSchedule: '2026.05.20',
    memo: '코테 준비',
  },
  {
    id: '3',
    company: '네이버',
    position: '백엔드 개발자',
    stage: '면접합격',
    appliedDate: '2026.05.16',
    nextSchedule: '2026.05.20',
    memo: '코테 준비',
  },
];

const STAGE_COLORS: Record<string, string> = {
  '지원해석': 'bg-yellow-100 text-yellow-700',
  '지원완료': 'bg-blue-100 text-blue-700',
  '면접합격': 'bg-red-100 text-red-700',
  '서류합격': 'bg-green-100 text-green-700',
  '면접중': 'bg-purple-100 text-purple-700',
};

export default function ApplicationStatusPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [data, setData] = useState<ApplicationItem[]>(MOCK_DATA);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    let filtered = data;

    if (activeTab === 'expected') {
      filtered = filtered.filter((item) => item.stage === '지원예정');
    } else if (activeTab === 'ongoing') {
      filtered = filtered.filter((item) => 
        ['지원해석', '지원완료', '면접중'].includes(item.stage)
      );
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter((item) => item.stage === '탈락');
    } else if (activeTab === 'passed') {
      filtered = filtered.filter((item) => item.stage === '최종합격');
    }

    return filtered;
  }, [data, activeTab]);

  const handleAddRow = () => {
    const newItem: ApplicationItem = {
      id: Date.now().toString(),
      company: '',
      position: '',
      stage: '',
      appliedDate: '',
      nextSchedule: '',
      memo: '',
    };
    setData([...data, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof ApplicationItem, value: string) => {
    setData(
      data.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    setData(data.filter((item) => item.id !== id));
  };

  const progressPercentage = Math.round(
    (data.filter((item) => 
      ['지원완료', '면접중', '최종합격'].includes(item.stage)
    ).length / data.length) * 100
  ) || 0;

  return (
    <div className="pt-12 grid grid-cols-[1fr_240px] gap-4">
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-app-text">입사 지원 현황</h1>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <ApplicationStatusTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          <button
            onClick={handleAddRow}
            className="flex items-center gap-2 bg-app-primary text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-colors whitespace-nowrap"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 4V14M4 9H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            공고 추가
          </button>
        </div>

        <ApplicationStatusTable
          data={filteredData}
          editingId={editingId}
          onEditingChange={setEditingId}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          stageColors={STAGE_COLORS}
        />
      </div>

      <div className="space-y-6">
        <ApplicationStatusCard
          title="다가오는 일정"
          iconSrc="/calendar-icon.png"
          items={[
            { label: '1차 면접', date: 'D-4', detail: '이마트 토요일', time: '이번 주 토요일' },
            { label: '1차 면접', date: 'D-7', detail: '신한투자증권', time: '2026.06.04' },
            { label: '1차 면접', date: 'D-4', detail: '토스증권', time: '이번 주 토요일' },
          ]}
        />

        <div className="border border-app-border rounded-lg p-6 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <img src="/percent-icon.png" alt="지원 현황" className="w-5 h-5"/>
            <h3 className="font-semibold text-app-text">지원 현황 요약</h3>
          </div>

          <div className="flex justify-center mt-10 mb-6">
            <div className="scale-150">
              <ScoreGauge2 score={progressPercentage} />
            </div>
          </div>

          <div className="text-center text-xs text-app-text-muted">
            총 지원 {data.length}건
          </div>
        </div>
      </div>
    </div>
  );
}