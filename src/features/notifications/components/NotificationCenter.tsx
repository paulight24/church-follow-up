import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle,
  Send,
  Heart,
  GraduationCap,
  Settings,
  Bell,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatRelativeDate } from '@/lib/formatters';
import { cn } from '@/lib/cn';
import { notificationsApi } from '../api/notifications.api';
import type { Notification, NotificationType } from '../types';

const typeIcons: Record<string, ReactNode> = {
  ESCALATION: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  FOLLOW_UP_ASSIGNED: <CheckCircle className="h-5 w-5 text-emerald-500" />,
  FOLLOW_UP_DUE: <CheckCircle className="h-5 w-5 text-emerald-500" />,
  CAMPAIGN: <Send className="h-5 w-5 text-blue-500" />,
  PRAYER_REQUEST: <Heart className="h-5 w-5 text-rose-500" />,
  FOUNDATION_SCHOOL: <GraduationCap className="h-5 w-5 text-indigo-500" />,
  SYSTEM: <Settings className="h-5 w-5 text-slate-500" />,
};

function iconForType(type: NotificationType): ReactNode {
  return typeIcons[type as string] ?? <Bell className="h-5 w-5 text-slate-400" />;
}

interface NotificationCenterProps {
  className?: string;
  onNavigate?: (notification: Notification) => void;
}

export function NotificationCenter({ className, onNavigate }: NotificationCenterProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationsApi.getNotifications({ pageSize: 20 }).then((res) => res.data),
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  function handleSelect(notification: Notification) {
    if (!notification.readAt) {
      markAsReadMutation.mutate(notification.id);
    }
    onNavigate?.(notification);
  }

  const notifications = data?.data ?? [];
  const hasUnread = notifications.some((n) => !n.readAt);

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Notifications</CardTitle>
        <button
          type="button"
          onClick={() => markAllReadMutation.mutate()}
          disabled={!hasUnread || markAllReadMutation.isPending}
          className="text-sm font-medium text-indigo-600 transition hover:text-indigo-700 disabled:pointer-events-none disabled:opacity-40"
        >
          Mark all as read
        </button>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner size="md" className="text-indigo-600" />
          </div>
        ) : isError ? (
          <p className="px-4 py-6 text-center text-sm text-rose-600">
            Could not load notifications.
          </p>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up."
          />
        ) : (
          <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(notification)}
                  className={cn(
                    'flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50',
                    !notification.readAt && 'bg-indigo-50',
                  )}
                >
                  <span className="mt-0.5 shrink-0">{iconForType(notification.type)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                    <p className="text-sm text-slate-500">{notification.body}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatRelativeDate(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.readAt && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
