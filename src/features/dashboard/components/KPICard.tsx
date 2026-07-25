import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

const colorConfig = {
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    ring: 'ring-indigo-500/20',
  },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    ring: 'ring-emerald-500/20',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    ring: 'ring-amber-500/20',
  },
  rose: {
    bg: 'bg-rose-50',
    icon: 'text-rose-600',
    ring: 'ring-rose-500/20',
  },
  sky: {
    bg: 'bg-sky-50',
    icon: 'text-sky-600',
    ring: 'ring-sky-500/20',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    ring: 'ring-purple-500/20',
  },
} as const;

interface KPICardProps {
  title: string;
  value: string | number;
  /** Optional trend delta. The live API doesn't provide week-over-week deltas, so most cards omit this. */
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  color: keyof typeof colorConfig;
  isLoading?: boolean;
}

export function KPICard({ title, value, change, changeLabel, icon: Icon, color, isLoading }: KPICardProps) {
  const config = colorConfig[color];
  const isPositive = (change ?? 0) >= 0;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4 px-6 py-5">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1',
            config.bg,
            config.ring,
          )}
        >
          <Icon className={cn('h-6 w-6', config.icon)} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {isLoading ? <span className="inline-block h-6 w-12 animate-pulse rounded bg-slate-200" /> : value}
          </p>
          {change !== undefined && !isLoading && (
            <div className="mt-1.5 flex items-center gap-1.5">
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  isPositive ? 'text-emerald-600' : 'text-rose-600',
                )}
              >
                {isPositive ? '+' : ''}
                {change}
              </span>
              {changeLabel && <span className="text-xs text-slate-400">{changeLabel}</span>}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
