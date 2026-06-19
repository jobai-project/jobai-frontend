import { useState } from 'react';
import MyPageTabNavigation from '@/components/mypage/MyPageTabNavigation';
import ProfileSection from '@/components/mypage/ProfileSection';
import NotificationSettings from '@/components/mypage/NotificationSettings';

type TabType = 'profile' | 'notification';

interface UserProfile {
  name: string;
  email: string;
  jobConditions: {
    positions: string[];
    locations: string[];
    experiences: string[];
  };
  resumes: Array<{
    id: string;
    name: string;
    date: string;
    status: 'primary' | 'secondary';
  }>;
}

const MOCK_USER: UserProfile = {
  name: '김주은',
  email: 'juhoonkim22@gmail.com',
  jobConditions: {
    positions: ['프론트엔드 개발'],
    locations: ['서울 강남', '부산'],
    experiences: ['신입'],
  },
  resumes: [
    {
      id: '1',
      name: '김주은_이력서_20260606.pdf',
      date: '2026.06.06',
      status: 'primary',
    },
    {
      id: '2',
      name: '김주은_이력서_20260601.pdf',
      date: '2026.06.01',
      status: 'secondary',
    },
  ],
};

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [user, setUser] = useState<UserProfile>(MOCK_USER);

  const handleNameChange = (newName: string) => {
    setUser({ ...user, name: newName });
  };

  const handleJobConditionsChange = (conditions: UserProfile['jobConditions']) => {
    setUser({ ...user, jobConditions: conditions });
  };

  return (
    <div className="pt-12">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-app-text mb-1">마이페이지</h1>
      </div>

      {/* 탭 네비게이션 */}
      <MyPageTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 탭 콘텐츠 */}
      {activeTab === 'profile' ? (
        <ProfileSection
          user={user}
          onNameChange={handleNameChange}
          onJobConditionsChange={handleJobConditionsChange}
        />
      ) : (
        <NotificationSettings />
      )}
    </div>
  );
}