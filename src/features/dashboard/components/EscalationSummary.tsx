import { Link } from 'react-router-dom';
import {
  Heart,
  AlertOctagon,
  Activity,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const escalations = [
  {
    id: '1',
    title: 'Pastoral visit needed for the Adams family',
    type: 'PASTORAL_NEED' as const,
    priority: 'HIGH' as const,
    timeAgo: '2 hours ago',
  },
  {
    id: '2',
    title: 'Medical emergency -- Brother Thomas hospitalized',
    type: 'MEDICAL' as const,
    priority: 'CRITICAL' as const,
    timeAgo: '5 hours ago',
  },
  {
    id: '3',
    title: 'Spiritual counseling request from new member',
    type: 'SPIRITUAL_DISTRESS' as const,
    priority: 'MEDIUM' as const,
    timeAgo: 'Yesterday',
  },
  {
    id: '4',
    title: 'Crisis support for Sister Williams',
    type: 'CRISIS' as const,
    priority: 'HIGH' as const,
    timeAgo: '2 days ago',
  },
];

const typeIcons: Record<string, typeof Heart> = {
  PASTORAL_NEED: Heart,
  MEDICAL: Activity,
  SPIRITUAL_DISTRESS: Flame,
  CRISIS: AlertOctagon,
};

const typeIconColors: Record<string, string> = {
  PASTORAL_NEED: 'text-rose-500 bg-rose-50',
  MEDICAL: 'text-sky-500 bg-sky-50',
  SPIRITUAL_DISTRESS: 'text-amber-500 bg-amber-50',
  CRISIS: 'text-red-500 bg-red-50',
};

const priorityVariants: Record<string, 'danger' | 'warning' | 'default' | 'gray'> = {
  CRITICAL: 'danger',
  HIGH: 'warning',
  MEDIUM: 'default',
  LOW: 'gray',
};

const escalationCounts = [
  { label: 'Pastoral', count: 2 },
  { label: 'Medical', count: 1 },
  { label: 'Crisis', count: 1 },
  { label: 'Spiritual', count: 1 },
];

export function EscalationSummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Escalations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Counts by type */}
        <div className="flex flex-wrap gap-2">
          {escalationCounts.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5"
            >
              <span className="text-xs font-medium text-slate-600">{item.label}</span>
              <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-xs font-bold text-slate-700">
                {item.count}
              </span>
            </div>
          ))}
        </div>

        {/* Recent escalations list */}
        <div className="space-y-3">
          {escalations.map((escalation) => {
            const Icon = typeIcons[escalation.type] ?? AlertOctagon;
            const iconColor = typeIconColors[escalation.type] ?? 'text-slate-500 bg-slate-50';

            return (
              <div
                key={escalation.id}
                className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconColor}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {escalation.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge
                      variant={priorityVariants[escalation.priority]}
                      size="sm"
                    >
                      {escalation.priority}
                    </Badge>
                    <span className="text-xs text-slate-400">{escalation.timeAgo}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter>
        <Link
          to="/escalations"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          View all escalations
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
