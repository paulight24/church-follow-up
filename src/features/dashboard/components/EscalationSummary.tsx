import { Link } from 'react-router-dom';
import {
  Heart,
  AlertOctagon,
  Activity,
  Flame,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { formatRelativeDate } from '@/lib/formatters';

export interface EscalationListItem {
  id: string;
  title: string;
  category: string;
  priority: string;
  createdAt: string;
}

export interface EscalationCategoryCount {
  label: string;
  count: number;
}

interface EscalationSummaryProps {
  items: EscalationListItem[];
  counts?: EscalationCategoryCount[];
  isLoading?: boolean;
  emptyMessage?: string;
}

const typeIcons: Record<string, typeof Heart> = {
  BEREAVEMENT: Heart,
  HOSPITALIZATION: Activity,
  FAMILY_CRISIS: AlertOctagon,
  SAFETY: AlertOctagon,
  HOUSING: Heart,
  EMPLOYMENT: Heart,
  SPIRITUAL_COUNSELING: Flame,
  REPEATED_NO_CONTACT: ShieldAlert,
  OTHER: ShieldAlert,
};

const typeIconColors: Record<string, string> = {
  BEREAVEMENT: 'text-rose-500 bg-rose-50',
  HOSPITALIZATION: 'text-sky-500 bg-sky-50',
  FAMILY_CRISIS: 'text-red-500 bg-red-50',
  SAFETY: 'text-red-500 bg-red-50',
  HOUSING: 'text-amber-500 bg-amber-50',
  EMPLOYMENT: 'text-amber-500 bg-amber-50',
  SPIRITUAL_COUNSELING: 'text-amber-500 bg-amber-50',
  REPEATED_NO_CONTACT: 'text-purple-500 bg-purple-50',
  OTHER: 'text-slate-500 bg-slate-50',
};

const priorityVariants: Record<string, 'danger' | 'warning' | 'default' | 'gray'> = {
  URGENT: 'danger',
  HIGH: 'warning',
  NORMAL: 'default',
  LOW: 'gray',
};

export function EscalationSummary({ items, counts, isLoading, emptyMessage = 'No active escalations right now.' }: EscalationSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Escalations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : (
          <>
            {counts && counts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {counts.map((item) => (
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
            )}

            {items.length === 0 ? (
              <EmptyState icon={ShieldAlert} title="Nothing to escalate" description={emptyMessage} />
            ) : (
              <div className="space-y-3">
                {items.map((escalation) => {
                  const Icon = typeIcons[escalation.category] ?? AlertOctagon;
                  const iconColor = typeIconColors[escalation.category] ?? 'text-slate-500 bg-slate-50';

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
                          <Badge variant={priorityVariants[escalation.priority] ?? 'gray'} size="sm">
                            {escalation.priority}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {formatRelativeDate(escalation.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
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
