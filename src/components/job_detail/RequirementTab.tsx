import RequirementGroup from './RequirementGroup';
import { mockRequirements } from '@/data/requirements';

export default function RequirementTab() {
  // TODO(백엔드 연동 필요): props 또는 쿼리로 실제 요건 데이터 주입
  const groups = mockRequirements;

  // 탭 콘텐츠 래퍼(JobDetailPage)가 이미 py-6(24px)을 갖고 있어 세로 패딩을 보정한다.
  // 좌우: px-10(40px), 상단: 24+pt-8(32)=56px, 하단: 24+pb-10(40)=64px → Figma 확정값과 일치.
  return (
    <div className="flex flex-col gap-8 px-10 pt-8 pb-10">
      {groups.map((group) => (
        <RequirementGroup key={group.key} group={group} />
      ))}
    </div>
  );
}
