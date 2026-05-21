import BackButton from '@/components/common/BackButton';

interface PlaceholderPageProps {
  icon: string;
  title: string;
  description?: string;
}

export default function PlaceholderPage({
  icon,
  title,
  description = '준비 중입니다.',
}: PlaceholderPageProps) {
  return (
    <div className="relative flex min-h-[60vh] flex-col items-center justify-center gap-3 text-app-text-subtle">
      <BackButton />
      <div className="mb-1 text-4xl text-app-text-subtle">{icon}</div>
      <div className="text-lg font-semibold text-app-text-muted">{title}</div>
      <div className="text-sm text-app-text-subtle">{description}</div>
    </div>
  );
}
