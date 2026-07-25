import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Send,
  UserPlus,
  Heart,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatRelativeDate } from '@/lib/formatters';
import { cn } from '@/lib/cn';

interface Notification {
  id: string;
  type: 'escalation' | 'followup' | 'campaign' | 'member' | 'prayer';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
}

const typeIcons: Record<Notification['type'], ReactNode> = {
  escalation: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  followup: <CheckCircle className="h-5 w-5 text-emerald-500" />,
  campaign: <Send className="h-5 w-5 text-blue-500" />,
  member: <UserPlus className="h-5 w-5 text-indigo-500" />,
  prayer: <Heart className="h-5 w-5 text-rose-500" />,
};

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'escalation',
    title: 'New escalation reported',
    description: 'Chioma Eze reported a pastoral need',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: '2',
    type: 'followup',
    title: 'Follow-up completed',
    description: 'Adebayo completed follow-up with Mrs. Okonkwo',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: '3',
    type: 'campaign',
    title: 'Campaign sent',
    description: 'Easter Sunday Reminder sent to 234 members',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: '4',
    type: 'member',
    title: 'New member registered',
    description: 'John Obi registered as a first timer',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: '5',
    type: 'prayer',
    title: 'Prayer request',
    description: 'Anonymous prayer request submitted',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
  },
];

export function NotificationCenter() {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function handleMarkAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Notifications</CardTitle>
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
        >
          Mark all as read
        </button>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-slate-100">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <button
                type="button"
                onClick={() => handleMarkAsRead(notification.id)}
                className={cn(
                  'flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50',
                  !notification.read && 'bg-indigo-50',
                )}
              >
                <span className="mt-0.5 shrink-0">
                  {typeIcons[notification.type]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {notification.title}
                  </p>
                  <p className="text-sm text-slate-500">
                    {notification.description}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatRelativeDate(notification.timestamp)}
                  </p>
                </div>
                {!notification.read && (
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
