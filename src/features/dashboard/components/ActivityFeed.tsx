import {
  UserPlus,
  ClipboardCheck,
  CheckCircle2,
  Heart,
  MessageSquare,
  Users,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';

const activities = [
  {
    id: '1',
    icon: ClipboardCheck,
    iconColor: 'text-indigo-500 bg-indigo-50',
    description: 'John Osei assigned a follow-up task to Mary Johnson',
    user: 'John Osei',
    timeAgo: '25 minutes ago',
  },
  {
    id: '2',
    icon: UserPlus,
    iconColor: 'text-emerald-500 bg-emerald-50',
    description: 'New member registered: Sarah Thompson',
    user: 'System',
    timeAgo: '1 hour ago',
  },
  {
    id: '3',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500 bg-emerald-50',
    description: 'Ruth Adeyemi completed follow-up with David Chen',
    user: 'Ruth Adeyemi',
    timeAgo: '2 hours ago',
  },
  {
    id: '4',
    icon: Heart,
    iconColor: 'text-rose-500 bg-rose-50',
    description: 'Escalation resolved by Pastor James for the Adams family',
    user: 'Pastor James',
    timeAgo: '3 hours ago',
  },
  {
    id: '5',
    icon: MessageSquare,
    iconColor: 'text-sky-500 bg-sky-50',
    description: 'Encouragement message sent to 24 members via SMS',
    user: 'Mary Johnson',
    timeAgo: 'Yesterday',
  },
  {
    id: '6',
    icon: Users,
    iconColor: 'text-purple-500 bg-purple-50',
    description: 'New team "Campus Ministry" created with 5 members',
    user: 'Admin',
    timeAgo: 'Yesterday',
  },
  {
    id: '7',
    icon: ClipboardCheck,
    iconColor: 'text-indigo-500 bg-indigo-50',
    description: 'Pastor James assigned 3 follow-up tasks to the Outreach team',
    user: 'Pastor James',
    timeAgo: '2 days ago',
  },
];

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-200" />

          <div className="space-y-5">
            {activities.map((activity) => {
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
      </CardContent>
    </Card>
  );
}
