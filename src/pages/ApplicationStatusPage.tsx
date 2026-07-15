import { useEffect, useMemo, useState } from 'react';
import ApplicationStatusTabNavigation from '@/components/application/ApplicationStatusTabNavigation';
import ApplicationStatusTable from '@/components/application/ApplicationStatusTable';
import ApplicationSummaryCard from '@/components/application/ApplicationSummaryCard';
import UpcomingScheduleCard from '@/components/application/UpcomingScheduleCard';
import {
  useApplications,
  useCreateApplication,
  useUpdateApplication,
  useDeleteApplication,
} from '@/hooks/useApplications';
import {
  STATUS_TO_STAGE,
  STAGE_TO_STATUS,
  formatDateForDisplay,
  formatDateForApi,
} from '@/utils/applicationStatusMapping';
import type { ApplicationApiItem } from '@/types/application';

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

const STAGE_COLORS: Record<string, string> = {
  '지원예정': 'bg-[#FFF5E5] text-[#E49735]',
  '지원완료': 'bg-[#F3F3FC] text-[#5C69FF]',
  '서류합격': 'bg-[#E8F8F1] text-[#35A97A]',
  '면접합격': 'bg-[#E8F8F1] text-[#35A97A]',
  '최종합격': 'bg-[#E8F8F1] text-[#35A97A]',
  '서류탈락': 'bg-[#FDE7E9] text-[#F36975]',
  '면접탈락': 'bg-[#FDE7E9] text-[#F36975]',
};

// API 응답 항목 → 화면에서 쓰는 ApplicationItem 형태로 변환
const mapApiItemToApplicationItem = (apiItem: ApplicationApiItem): ApplicationItem => ({
  id: String(apiItem.applicationId),
  company: apiItem.companyName,
  position: apiItem.jobTitle,
  stage: STATUS_TO_STAGE[apiItem.status] ?? apiItem.statusLabel,
  appliedDate: formatDateForDisplay(apiItem.appliedAt),
  nextSchedule: formatDateForDisplay(apiItem.interviewAt),
  memo: apiItem.memo ?? '',
});

export default function ApplicationStatusPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);

  // 서버 상태(TanStack Query)와 화면에서 바로 편집하는 로컬 상태를 분리한다.
  // - data: 편집 중 타이핑을 즉시 반영하기 위한 로컬 사본(각 keystroke마다 갱신)
  // - 실제 서버 반영(PATCH)은 blur/선택 확정 시점에만 일어난다(onCommitField).
  const { data: applicationsData, isLoading } = useApplications();
  const [data, setData] = useState<ApplicationItem[]>([]);

  useEffect(() => {
    if (applicationsData) {
      setData(applicationsData.applications.map(mapApiItemToApplicationItem));
    }
  }, [applicationsData]);

  const createMutation = useCreateApplication();
  const updateMutation = useUpdateApplication();
  const deleteMutation = useDeleteApplication();

  const filteredData = useMemo(() => {
    let filtered = data;

    if (activeTab === 'expected') {
      filtered = filtered.filter((item) => item.stage === '지원예정');
    } else if (activeTab === 'ongoing') {
      filtered = filtered.filter((item) =>
        ['지원예정', '지원완료', '서류합격', '면접합격'].includes(item.stage),
      );
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter((item) =>
        ['서류탈락', '면접탈락'].includes(item.stage),
      );
    } else if (activeTab === 'passed') {
      filtered = filtered.filter((item) => item.stage === '최종합격');
    }

    return filtered;
  }, [data, activeTab]);

  // "공고 추가" 클릭 시 바로 서버에 빈 값으로 생성 요청을 보내
  // applicationId를 받아온 뒤, 그 ID로 로컬 행을 추가한다.
  const handleAddRow = async () => {
    try {
      const { applicationId } = await createMutation.mutateAsync({
        companyName: '',
        jobTitle: '',
        status: 'PLANNED',
      });

      const newItem: ApplicationItem = {
        id: String(applicationId),
        company: '',
        position: '',
        stage: '지원예정',
        appliedDate: '',
        nextSchedule: '',
        memo: '',
      };

      setData((prev) => [...prev, newItem]);
      setNewlyAddedId(newItem.id);
    } catch (error) {
      console.error('공고 추가 실패:', error);
    }
  };

  // 로컬 상태만 즉시 갱신 (타이핑마다 서버로 보내지 않음)
  const handleUpdateItem = (id: string, field: keyof ApplicationItem, value: string) => {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  // blur/선택 확정 시점에 실제 PATCH 호출
  const handleCommitField = (id: string, field: keyof ApplicationItem) => {
    const item = data.find((d) => d.id === id);
    if (!item) return;

    const applicationId = Number(id);

    if (field === 'company') {
      updateMutation.mutate({ applicationId, payload: { companyName: item.company } });
    } else if (field === 'position') {
      updateMutation.mutate({ applicationId, payload: { jobTitle: item.position } });
    } else if (field === 'stage') {
      const status = STAGE_TO_STATUS[item.stage];
      if (status) {
        updateMutation.mutate({ applicationId, payload: { status } });
      }
    } else if (field === 'appliedDate') {
      const appliedAt = formatDateForApi(item.appliedDate);
      // 형식이 올바를 때만 반영 (입력 중인 불완전한 날짜는 서버로 보내지 않음)
      if (appliedAt !== null || item.appliedDate === '') {
        updateMutation.mutate({ applicationId, payload: { appliedAt } });
      }
    } else if (field === 'nextSchedule') {
      const interviewAt = formatDateForApi(item.nextSchedule);
      if (interviewAt !== null || item.nextSchedule === '') {
        updateMutation.mutate({ applicationId, payload: { interviewAt } });
      }
    } else if (field === 'memo') {
      updateMutation.mutate({ applicationId, payload: { memo: item.memo || null } });
    }
  };

  const handleDeleteItem = (id: string) => {
    setData((prev) => prev.filter((item) => item.id !== id));
    deleteMutation.mutate(Number(id));
  };

  return (
    <div className="pt-12 grid grid-cols-[808px_240px] gap-4">
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-app-text">입사 지원 현황</h1>
        </div>
        <div className="w-[808px] flex justify-between items-end gap-4 mb-6">
          <ApplicationStatusTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          <button
            onClick={handleAddRow}
            disabled={createMutation.isPending}
            className="w-[103px] h-[37px] flex items-center gap-2 bg-app-primary text-white px-4 py-2 rounded-[12px] font-semibold text-[14px] hover:opacity-90 transition-colors whitespace-nowrap disabled:opacity-50"
          >
            <img src="/plus-icon.png" alt="추가" width="14" height="14" />
            공고 추가
          </button>
        </div>

        {isLoading ? (
          <div className="w-[808px] h-[400px] flex items-center justify-center text-app-text-muted text-sm">
            불러오는 중...
          </div>
        ) : (
          <ApplicationStatusTable
            data={filteredData}
            editingId={editingId}
            onEditingChange={setEditingId}
            onUpdateItem={handleUpdateItem}
            onCommitField={handleCommitField}
            onDeleteItem={handleDeleteItem}
            stageColors={STAGE_COLORS}
            newlyAddedId={newlyAddedId}
            onNewlyAddedHandled={() => setNewlyAddedId(null)}
            activeTab={activeTab}
          />
        )}
      </div>

      {/* 우측 카드: 실제 API 연동 (요약 /summary · 일정 /upcoming). CRUD 후 자동 갱신. */}
      <div className="space-y-5 mt-[130px]">
        <UpcomingScheduleCard />
        <ApplicationSummaryCard />
      </div>
    </div>
  );
}