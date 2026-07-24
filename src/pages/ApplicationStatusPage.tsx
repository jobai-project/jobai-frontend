import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ApplicationStatusTabNavigation from '@/components/application/ApplicationStatusTabNavigation';
import ApplicationStatusTable, {
  type ApplicationStatusTableRef,
} from '@/components/application/ApplicationStatusTable';
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
import type { ApplicationApiItem, ApplicationStatus } from '@/types/application';

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

const TEMP_ID_PREFIX = 'temp-';

// API 응답 항목 → 화면에서 쓰는 ApplicationItem 형태로 변환
const mapApiItemToApplicationItem = (apiItem: ApplicationApiItem): ApplicationItem => ({
  id: String(apiItem.applicationId),
  company: apiItem.companyName,
  position: apiItem.jobTitle,
  stage: STATUS_TO_STAGE[apiItem.status as ApplicationStatus] ?? apiItem.statusLabel,
  appliedDate: formatDateForDisplay(apiItem.appliedAt),
  nextSchedule: formatDateForDisplay(apiItem.interviewAt),
  memo: apiItem.memo ?? '',
});

export default function ApplicationStatusPage() {
  const tableRef = useRef<ApplicationStatusTableRef>(null);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  // 스크랩 페이지의 "+"로 넘어온 경우, 어느 칸부터 자동 편집을 열지 지정.
  // 기본은 'company'(직접 추가한 빈 행), 스크랩에서 온 경우는 'appliedDate'
  // (기업/직무/지원일이 이미 채워져 있으니 그 다음부터 채우면 되기 때문).
  const [startField, setStartField] = useState<'company' | 'appliedDate'>('company');

  // 스크랩 페이지의 "+"를 통해 이미 생성된 행을 갖고 이 페이지로 넘어온 경우 처리
  useEffect(() => {
    const state = location.state as { newlyAddedId?: string; startField?: 'appliedDate' } | null;
    if (state?.newlyAddedId) {
      setNewlyAddedId(state.newlyAddedId);
      setStartField(state.startField ?? 'company');
      // state를 소비한 뒤 지워서, 새로고침/뒤로가기 시 같은 로직이 재실행되지 않게 한다.
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  // 서버 상태(TanStack Query)와 화면에서 바로 편집하는 로컬 상태를 분리한다.
  // - data: 편집 중 타이핑을 즉시 반영하기 위한 로컬 사본(각 keystroke마다 갱신)
  // - 실제 서버 반영(PATCH)은 blur/선택 확정 시점에만 일어난다(onCommitField).
  const { data: applicationsData, isLoading } = useApplications();
  const [data, setData] = useState<ApplicationItem[]>([]);

  useEffect(() => {
    if (applicationsData) {
      setData((prev) => {
        // 아직 서버에 생성되지 않은 임시 행(temp-)은 목록 새로고침에 날아가지 않도록 보존한다.
        const tempItems = prev.filter((item) => item.id.startsWith(TEMP_ID_PREFIX));
        return [...applicationsData.applications.map(mapApiItemToApplicationItem), ...tempItems];
      });
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

    // 지원일(appliedDate) 기준 오름차순 정렬. 날짜 형식이 "YYYY.MM.DD"라
    // 문자열 비교만으로도 정확히 시간순 정렬이 된다. 아직 지원일이 없는
    // 임시/빈 행은 맨 뒤로 보낸다.
    return [...filtered].sort((a, b) => {
      if (!a.appliedDate && !b.appliedDate) return 0;
      if (!a.appliedDate) return 1;
      if (!b.appliedDate) return -1;
      return a.appliedDate.localeCompare(b.appliedDate);
    });
  }, [data, activeTab]);

  // "공고 추가" 클릭 시에는 서버 요청 없이 로컬 임시 행만 만든다.
  // (회사명이 필수 입력이라 빈 값으로는 서버에 생성할 수 없음 — 400 오류)
  // 실제 생성은 사용자가 회사명을 입력하고 그 칸에서 벗어나는 시점(handleCommitField)에 일어난다.
  const handleAddRow = () => {
    // 지금 편집 중인 칸이 검증에 걸려있으면(회사명/직무 미입력, 날짜 형식 오류 등),
    // 여기서 먼저 막는다 — 테이블의 검증을 우회해서 새 행을 만들 수 없게.
    if (tableRef.current && !tableRef.current.tryCloseEditing()) {
      return;
    }

    const tempId = `${TEMP_ID_PREFIX}${Date.now()}`;
    const newItem: ApplicationItem = {
      id: tempId,
      company: '',
      position: '',
      stage: '지원예정',
      appliedDate: '',
      nextSchedule: '',
      memo: '',
    };

    setData((prev) => [...prev, newItem]);
    setNewlyAddedId(tempId);
  };

  // 로컬 상태만 즉시 갱신 (타이핑마다 서버로 보내지 않음)
  const handleUpdateItem = (id: string, field: keyof ApplicationItem, value: string) => {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  // blur/선택 확정 시점에 실제 API 호출
  const handleCommitField = async (id: string, field: keyof ApplicationItem, valueOverride?: string,) => {
    const item = data.find((d) => d.id === id);
    if (!item) return;

    const isTemp = id.startsWith(TEMP_ID_PREFIX);

    // ── 아직 서버에 생성되지 않은 임시 행 ──
    if (isTemp) {
      // 서버는 companyName, jobTitle, status를 모두 필수로 요구한다.
      // status는 기본값(PLANNED 등)이 항상 있으니, company와 position 둘 다
      // 채워졌을 때만 생성을 시도한다.
      if (!item.company.trim() || !item.position.trim()) {
        return;
      }

      try {
        const { applicationId } = await createMutation.mutateAsync({
          companyName: item.company,
          jobTitle: item.position || '',
          status: STAGE_TO_STATUS[valueOverride ?? item.stage] ?? 'PLANNED',
          appliedAt: formatDateForApi(item.appliedDate),
          interviewAt: formatDateForApi(item.nextSchedule),
          memo: item.memo || null,
        });

        const realId = String(applicationId);

        // 임시 id를 실제 id로 교체
        setData((prev) =>
          prev.map((d) => (d.id === id ? { ...d, id: realId } : d)),
        );

        // 편집 중이던 셀이 계속 같은 자리에서 편집 상태를 유지하도록 id 갱신
        setEditingId((prevEditingId) => (prevEditingId === id ? realId : prevEditingId));
      } catch (error) {
        console.error('공고 생성 실패:', error);
      }
      return;
    }

    // ── 이미 생성된 행 → 부분 수정 ──
    const applicationId = Number(id);

    if (field === 'company') {
      updateMutation.mutate({ applicationId, payload: { companyName: item.company } });
    } else if (field === 'position') {
      updateMutation.mutate({ applicationId, payload: { jobTitle: item.position } });
    } else if (field === 'stage') {
      const stageValue = valueOverride ?? item.stage;
      const status = STAGE_TO_STATUS[stageValue];
      if (status) {
        updateMutation.mutate({ applicationId, payload: { status } });
      }
    } else if (field === 'appliedDate') {
      const appliedAt = formatDateForApi(item.appliedDate);
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
    // 아직 서버에 생성되지 않은 임시 행은 삭제 API를 호출할 필요가 없다.
    if (!id.startsWith(TEMP_ID_PREFIX)) {
      deleteMutation.mutate(Number(id));
    }
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
            className="w-[103px] h-[37px] flex items-center gap-2 bg-app-primary text-white px-4 py-2 rounded-[12px] font-semibold text-[14px] hover:opacity-90 transition-colors whitespace-nowrap"
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
            ref={tableRef}
            data={filteredData}
            editingId={editingId}
            onEditingChange={setEditingId}
            onUpdateItem={handleUpdateItem}
            onCommitField={handleCommitField}
            onDeleteItem={handleDeleteItem}
            stageColors={STAGE_COLORS}
            newlyAddedId={newlyAddedId}
            newlyAddedStartField={startField}
            onNewlyAddedHandled={() => setNewlyAddedId(null)}
            activeTab={activeTab}
          />
        )}
      </div>

      {/* 우측 카드: 실제 API 연동 (요약 /summary · 일정 /upcoming). CRUD 후 자동 갱신. */}
      <div className="space-y-5 mt-[125px]">
        <UpcomingScheduleCard />
        <ApplicationSummaryCard />
      </div>
    </div>
  );
}