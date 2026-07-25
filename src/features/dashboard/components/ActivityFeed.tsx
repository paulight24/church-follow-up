import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';

// NOTE: The backend has no dedicated activity-feed endpoint. This component
// is repurposed to surface real, available per-task data from GET /dashboard/me
// (e.g. a worker's recently completed follow-ups, or a team leader's tasks
// pending review) instead of the previous hardcoded activity log mock.

export interface ActivityItem {
  id: string;
  icon: LucideIcon;
  iconColor: string;
  description: string;
  user: string;
  timeAgo: string;
}

interface ActivityFeedProps {
  title?: string;
  items: ActivityItem[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ActivityFeed({
  title = 'Recent Activity',
  items,
  isLoading,
  emptyMessage = 'Nothing to show here yet.',
}: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={Inbox} title="No recent activity" description={emptyMessage} />
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-200" />

            <div className="space-y-5">
              {items.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div key={activity.id} className="relative flex gap-4">
                    {/* Timeline dot + icon */}
                    <div className="relative z-10 shrink-0">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-white ${activity.iconColor}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-0.5">
                      <p className="text-sm text-slate-700">{activity.description}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Avatar name={activity.user} size="sm" className="h-5 w-5 text-[10px]" />
                        <span className="text-xs text-slate-400">{activity.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
