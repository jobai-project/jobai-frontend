import { useState } from 'react';
import MyPageTabNavigation from '@/components/mypage/MyPageTabNavigation';
import ProfileSection from '@/components/mypage/ProfileSection';
import NotificationSettings from '@/components/mypage/NotificationSettings';
import {
  useMyPageInfo,
  useUpdateJobPreferences,
  useUpdateName,
  useUpdateJobCategory,
} from '@/hooks/useMember';

type TabType = 'profile' | 'notification';

// positions = '지역' / jobCategories = '희망 직무' / experiences = '고용 형태'
interface JobConditions {
  positions: string[];
  jobCategories: string[];
  experiences: string[];
}

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const { data, isLoading, isError } = useMyPageInfo();
  const updatePrefs = useUpdateJobPreferences();
  const updateName = useUpdateName();
  const updateJobCategory = useUpdateJobCategory();

  // 이름 편집: 서버 반영 성공 전까지는 낙관적으로 화면만 즉시 갱신, 실패 시 서버 값으로 되돌린다.
  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [jobConditionsError, setJobConditionsError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="pt-12">
        <div className="mb-8 h-8 w-40 animate-pulse rounded bg-[#F2F4F6]" />
        <div className="h-[400px] w-[700px] animate-pulse rounded-2xl bg-[#F2F4F6]" />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="pt-12 text-sm text-app-text-muted">
        마이페이지 정보를 불러오지 못했어요.
      </div>
    );
  }

  const { profile, jobPreference } = data;
  const name = nameOverride ?? profile.name;

  const jobConditions: JobConditions = {
    positions: jobPreference.locations, // 지역
    jobCategories: jobPreference.jobCategories, // 희망 직무
    experiences: jobPreference.careerType ? [jobPreference.careerType] : [], // 고용 형태
  };

  // E2 — 이름 수정. 서버가 공백만 있는 이름·20자 초과를 400으로 거부하므로 요청 전에 먼저 걸러낸다.
  const handleNameChange = (newName: string) => {
    const trimmed = newName.trim();

    if (!trimmed) {
      setNameError('이름은 공백일 수 없어요.');
      return;
    }
    if (trimmed.length > 20) {
      setNameError('이름은 최대 20자까지 입력할 수 있어요.');
      return;
    }

    setNameError(null);
    setNameOverride(newName);

    updateName.mutate(
      { name: newName },
      {
        onError: () => {
          setNameOverride(null);
          setNameError('이름 수정에 실패했어요. 다시 시도해주세요.');
        },
      },
    );
  };

  // 공고 조건 저장: 희망 직무(jobCategories)는 전용 PATCH로 먼저 안전하게 교체하고,
  // 성공한 뒤에 지역·고용형태를 job-preferences PUT으로 갱신한다.
  // PUT은 세 필드를 항상 같이 보내야 하므로, 여기서도 방금 저장한 새 jobCategories 값을
  // 그대로 함께 실어 보내 stale한 서버 값으로 덮어써지는 사고를 막는다.
  const handleJobConditionsChange = (edited: JobConditions) => {
    setJobConditionsError(null);

    updateJobCategory.mutate(
      { jobCategories: edited.jobCategories },
      {
        onSuccess: () => {
          updatePrefs.mutate(
            {
              careerType: edited.experiences[0] ?? jobPreference.careerType ?? '',
              locations: edited.positions,
              jobCategories: edited.jobCategories,
            },
            {
              onError: () => {
                setJobConditionsError('지역/고용형태 저장에 실패했어요. 다시 시도해주세요.');
              },
            },
          );
        },
        onError: () => {
          setJobConditionsError('희망 직무 저장에 실패했어요. 다시 시도해주세요.');
        },
      },
    );
  };

  return (
    <div className="pt-12">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold text-app-text">마이페이지</h1>
      </div>

      <MyPageTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'profile' ? (
        <>
          <ProfileSection
            user={{ name, email: profile.email, jobConditions }}
            onNameChange={handleNameChange}
            onJobConditionsChange={handleJobConditionsChange}
          />
          {nameError && <p className="mt-2 text-xs text-red-500">{nameError}</p>}
          {jobConditionsError && (
            <p className="mt-2 text-xs text-red-500">{jobConditionsError}</p>
          )}
        </>
      ) : (
        <NotificationSettings />
      )}
    </div>
  );
}