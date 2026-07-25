import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Heart,
  AlertTriangle,
  Clock,
  CheckCircle2,
  CalendarClock,
  Sparkles,
  Lock,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { prayerRequestsApi } from '../api/prayer-requests.api';

const STAT_TILES = [
  {
    key: 'newRequests' as const,
    label: 'New Requests',
    icon: Heart,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
  },
  {
    key: 'urgent' as const,
    label: 'Urgent (Pastoral)',
    icon: AlertTriangle,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
  {
    key: 'notYetPrayed' as const,
    label: 'Not Yet Prayed',
    icon: Clock,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    key: 'prayedToday' as const,
    label: 'Prayed Today',
    icon: CheckCircle2,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    key: 'needsFollowUp' as const,
    label: 'Needs Follow-Up',
    icon: CalendarClock,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    key: 'testimonies' as const,
    label: 'Testimonies',
    icon: Sparkles,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    key: 'confidentialCount' as const,
    label: 'Confidential Requests',
    icon: Lock,
    iconBg: 'bg-slate-200',
    iconColor: 'text-slate-600',
  },
];

export function PrayerDashboardPage() {
  const navigate = useNavigate();

  const dashboardQuery = useQuery({
    queryKey: ['prayer-requests', 'dashboard'],
    queryFn: () => prayerRequestsApi.getDashboard().then((res) => res.data),
    refetchInterval: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Morning Prayer Dashboard"
        description="A snapshot of the congregation's prayer needs right now"
        actions={
          <Button variant="outline" onClick={() => navigate('/prayer-requests')}>
            View All Requests
          </Button>
        }
      />

      {dashboardQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      ) : dashboardQuery.isError ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-rose-600">
            Failed to load the prayer dashboard. Please try again.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_TILES.map((tile) => {
            const Icon = tile.icon;
            const value = dashboardQuery.data?.[tile.key] ?? 0;
            return (
              <Card key={tile.key}>
                <CardContent className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tile.iconBg}`}>
                    <Icon className={`h-5 w-5 ${tile.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                    <p className="text-sm text-slate-500">{tile.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
