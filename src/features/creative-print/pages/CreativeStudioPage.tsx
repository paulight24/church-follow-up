import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Layers, Plus, Printer, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { usePermission } from '@/hooks/usePermission';
import { creativeApi } from '../api/creativePrint.api';
import { FLYER_STATUS_LABELS, PRINT_SIZE_LABELS } from '../lib/format';
import type { FlyerStatus } from '@/types/creativePrint';

const STATUS_OPTIONS = [
  { label: 'All flyers', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Ready to review', value: 'READY' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

export function CreativeStudioPage() {
  const navigate = useNavigate();
  const canCreate = usePermission('creative.create');
  const [status, setStatus] = useState<FlyerStatus | ''>('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['flyers', { status }],
    queryFn: () =>
      creativeApi.getFlyers({ status: status || undefined, pageSize: 100 }).then((res) => res.data),
    // Concepts arrive a few seconds after a generate, so a studio left open
    // should show them without a manual refresh.
    refetchInterval: (query) =>
      (query.state.data?.data ?? []).some((f) => f.status === 'GENERATING') ? 3000 : false,
  });

  const flyers = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Creative Studio"
        subtitle="Describe an event and get a print-ready flyer — approve it, then download or order copies"
        actions={
          canCreate ? (
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/creative/new')}>
              Create Flyer
            </Button>
          ) : undefined
        }
      />

      <Card>
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <div className="w-full sm:w-64">
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => setStatus(e.target.value as FlyerStatus | '')}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-indigo-600" />
          </div>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-rose-600">Could not load flyers.</p>
        ) : flyers.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title={status ? 'No flyers with that status' : 'No flyers yet'}
            description={
              canCreate
                ? 'Describe an event and MemberCare will design a flyer you can approve, download and print.'
                : 'No flyers have been created yet.'
            }
            action={
              canCreate ? (
                <Button
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => navigate('/creative/new')}
                >
                  Create Flyer
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            {flyers.map((flyer) => (
              <Link key={flyer.id} to={`/creative/${flyer.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="space-y-3 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-900">{flyer.title}</h3>
                      <StatusBadge status={flyer.status} type="flyer" />
                    </div>

                    {flyer.event ? (
                      <p className="flex items-center gap-1.5 text-sm text-slate-500">
                        <CalendarDays className="h-4 w-4" />
                        {flyer.event.name}
                      </p>
                    ) : null}

                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Layers className="h-4 w-4" />
                        {flyer.versionCount} {flyer.versionCount === 1 ? 'version' : 'versions'}
                      </span>
                      <span>{PRINT_SIZE_LABELS[flyer.printSize]}</span>
                    </div>

                    {flyer.status === 'GENERATING' ? (
                      <p className="flex items-center gap-2 text-sm text-indigo-600">
                        <Spinner size="sm" className="text-indigo-600" />
                        {FLYER_STATUS_LABELS.GENERATING}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Printer className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
            <div>
              <p className="font-medium text-slate-900">Print orders</p>
              <p className="text-sm text-slate-500">
                Track anything you have sent to a printer, and download print-ready files again.
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/creative/orders')}>
            View orders
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
