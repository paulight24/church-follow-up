import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, HeartHandshake, LayoutDashboard } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { prayerRequestsApi } from '../api/prayer-requests.api';
import { PrayerRequestCard } from '../components/PrayerRequestCard';
import { PrayerRequestFormModal } from '../components/PrayerRequestFormModal';
import { AssignPrayerRequestModal } from '../components/AssignPrayerRequestModal';
import type { PrayerRequestStatus } from '@/types/prayerRequest';

const STATUS_OPTIONS: Array<{ label: string; value: PrayerRequestStatus | '' }> = [
  { label: 'All Statuses', value: '' },
  { label: 'New', value: 'NEW' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'Prayed', value: 'PRAYED' },
  { label: 'Follow-Up Needed', value: 'FOLLOW_UP_NEEDED' },
  { label: 'Testimony Received', value: 'TESTIMONY_RECEIVED' },
  { label: 'Closed', value: 'CLOSED' },
];

const PAGE_SIZE = 12;

export function PrayerRequestListPage() {
  const [status, setStatus] = useState<PrayerRequestStatus | ''>('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [assignRequestId, setAssignRequestId] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['prayer-requests', 'categories'],
    queryFn: () => prayerRequestsApi.getCategories().then((res) => res.data),
  });

  const listQuery = useQuery({
    queryKey: ['prayer-requests', 'list', { status, categoryId, page }],
    queryFn: () =>
      prayerRequestsApi
        .getPrayerRequests({
          status: status || undefined,
          categoryId: categoryId || undefined,
          page,
          pageSize: PAGE_SIZE,
        })
        .then((res) => res.data),
  });

  const requests = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prayer Requests"
        actions={
          <>
            <Link to="/prayer-requests/dashboard">
              <Button variant="outline" leftIcon={<LayoutDashboard className="h-4 w-4" />}>
                Dashboard
              </Button>
            </Link>
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
              New Request
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="w-full sm:w-56">
            <Select
              label="Status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as PrayerRequestStatus | '');
                setPage(1);
              }}
              options={STATUS_OPTIONS}
            />
          </div>
          <div className="w-full sm:w-56">
            <Select
              label="Category"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              options={[
                { label: 'All Categories', value: '' },
                ...(categoriesQuery.data ?? []).map((c) => ({ label: c.name, value: c.id })),
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {listQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <EmptyState
            icon={HeartHandshake}
            title="No prayer requests found"
            description="Prayer requests submitted by members and guests will appear here."
            action={
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
                New Request
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((request) => (
              <PrayerRequestCard key={request.id} request={request} onAssign={setAssignRequestId} />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
              totalItems={meta.total}
              pageSize={meta.limit}
            />
          )}
        </>
      )}

      <PrayerRequestFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} categories={categoriesQuery.data ?? []} />
      <AssignPrayerRequestModal
        isOpen={assignRequestId !== null}
        onClose={() => setAssignRequestId(null)}
        requestId={assignRequestId}
      />
    </div>
  );
}
