import { useState } from 'react';
import MyPageTabNavigation from '@/components/mypage/MyPageTabNavigation';
import ProfileSection from '@/components/mypage/ProfileSection';
import NotificationSettings from '@/components/mypage/NotificationSettings';
import { useMyPageInfo, useUpdateJobPreferences, useUpdateName } from '@/hooks/useMember';

type TabType = 'profile' | 'notification';

interface JobConditions {
  positions: string[];
  locations: string[];
  experiences: string[];
}

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const { data, isLoading, isError } = useMyPageInfo();
  const updatePrefs = useUpdateJobPreferences();
  const updateName = useUpdateName();

  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

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
    positions: jobPreference.locations,
    locations: [],
    experiences: jobPreference.careerType ? [jobPreference.careerType] : [],
  };

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

  const handleJobConditionsChange = (edited: JobConditions) => {
    updatePrefs.mutate({
      careerType: edited.experiences[0] ?? jobPreference.careerType ?? '',
      locations: edited.positions,
      jobCategories: jobPreference.jobCategories,
    });
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
        </>
      ) : (
        <NotificationSettings />
      )}
    </div>
  );
}