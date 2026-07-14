import { useState } from 'react';
import MyPageTabNavigation from '@/components/mypage/MyPageTabNavigation';
import ProfileSection from '@/components/mypage/ProfileSection';
import NotificationSettings from '@/components/mypage/NotificationSettings';
import { useConditionStore } from '@/stores/conditionStore';
import {
  conditionToEditable,
  editableToCondition,
} from '@/utils/conditionMapping';

type TabType = 'profile' | 'notification';

interface UserProfile {
  name: string;
  email: string;
  jobConditions: {
    positions: string[];
    locations: string[];
    experiences: string[];
  };
}

const MOCK_USER: UserProfile = {
  name: '김주은',
  email: 'juhoonkim22@gmail.com',
  jobConditions: {
    positions: ['프론트엔드 개발'],
    locations: ['서울 강남', '부산'],
    experiences: ['신입'],
  },
};

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [user, setUser] = useState<UserProfile>(MOCK_USER);

  // 공고 조건은 conditionStore(단일 소스)에서 읽고 쓴다. → 여기서 수정하면
  // 홈 "나에게 딱 맞는 공고" 필터에도 즉시 반영된다.
  const condition = useConditionStore((s) => s.condition);
  const setCondition = useConditionStore((s) => s.setCondition);
  const jobConditions = conditionToEditable(condition);

  const handleNameChange = (newName: string) => {
    setUser({ ...user, name: newName });
  };

  const handleJobConditionsChange = (conditions: UserProfile['jobConditions']) => {
    // scoreThreshold·jobRole은 편집기에 없으므로 기존값 보존
    setCondition(
      editableToCondition(
        conditions,
        condition?.scoreThreshold ?? 70,
        condition?.jobRole,
      ),
    );
  };

  return (
    <div className="pt-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-app-text mb-1">마이페이지</h1>
      </div>

      <MyPageTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'profile' ? (
        <ProfileSection
          user={{ ...user, jobConditions }}
          onNameChange={handleNameChange}
          onJobConditionsChange={handleJobConditionsChange}
        />
      ) : (
        <NotificationSettings />
      )}
    </div>
  );
}