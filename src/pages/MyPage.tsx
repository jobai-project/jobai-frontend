import { useState } from 'react';
import MyPageTabNavigation from '@/components/mypage/MyPageTabNavigation';
import ProfileSection from '@/components/mypage/ProfileSection';
import NotificationSettings from '@/components/mypage/NotificationSettings';
import { useMyPageInfo, useUpdateJobPreferences } from '@/hooks/useMember';

type TabType = 'profile' | 'notification';

// ⚠️ 편집기(JobConditionsEditor) 필드명이 내용과 뒤바뀌어 있음(재정렬은 별도 작업):
//   positions = '지역' / locations = '기업 형태'(공기업·사기업) / experiences = '고용 형태'
interface JobConditions {
  positions: string[];
  locations: string[];
  experiences: string[];
}

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const { data, isLoading, isError } = useMyPageInfo();
  const updatePrefs = useUpdateJobPreferences();

  // 이름 편집은 로컬만(E2 미연결). override 없으면 서버값 표시 → 첫 렌더 깜빡임 없음.
  const [nameOverride, setNameOverride] = useState<string | null>(null);

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

  // E1 jobPreference → 편집기 형태 매핑(위 뒤바뀐 필드명 그대로).
  const jobConditions: JobConditions = {
    positions: jobPreference.locations, // 지역
    locations: [], // 기업 형태: E1/E3에 소스 없음 → 표시만(빈 값)
    experiences: jobPreference.careerType ? [jobPreference.careerType] : [], // 고용 형태
  };

  // ⚠️ TODO(E2): 이름 수정이 로컬 state만 변경됨. PATCH /members/me/name 미연결.
  //    새로고침(리마운트) 시 서버 값으로 복귀. 다음 작업에서 연결 예정.
  const handleNameChange = (newName: string) => setNameOverride(newName);

  const handleJobConditionsChange = (edited: JobConditions) => {
    // 🔴 B안: E3는 전체 교체(PUT). jobCategories 를 빈 배열/미전송하면 서버에서 직무가 삭제되어
    //    matchScore 가 다시 '??' 로 회귀한다(이번 작업 최대 리스크). 편집기에 직무 자리가 없으므로
    //    E1 값을 그대로 재전송해 유실을 막는다.
    // ⚠️ TODO(BE Q7): 편집기 '기업 형태'(edited.locations)는 저장 필드가 없어 유실됨(표시만).
    // ❓ TODO: careerType 이 null 인 상태에서 E3 호출 시 서버 동작 미확인.
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
        <ProfileSection
          user={{ name, email: profile.email, jobConditions }}
          onNameChange={handleNameChange}
          onJobConditionsChange={handleJobConditionsChange}
        />
      ) : (
        <NotificationSettings />
      )}
    </div>
  );
}
