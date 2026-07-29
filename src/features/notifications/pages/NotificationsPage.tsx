import { PageHeader } from '@/components/layout/PageHeader';
import { NotificationCenter } from '../components/NotificationCenter';

export function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="View and manage your notifications"
      />
      <NotificationCenter className="max-w-2xl" />
    </div>
  );
}
