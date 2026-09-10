import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ExternalLink, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { resourcesApi } from '../api/resources.api';
import type { ResourcePageStatus } from '@/types/resource';

export function ResourcePageListPage() {
  const [status, setStatus] = useState<ResourcePageStatus | ''>('');

  const { data: pages, isLoading } = useQuery({
    queryKey: ['resource-pages', status],
    queryFn: () => resourcesApi.list(status || undefined).then((res) => res.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resource Pages</h1>
          <p className="mt-1 text-sm text-slate-500">
            One printed QR code per page. Swap what is behind it whenever you like — the code keeps
            working.
          </p>
        </div>
        <Link to="/resources/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New Page</Button>
        </Link>
      </div>

      <Select
        className="max-w-xs"
        value={status}
        onChange={(e) => setStatus(e.target.value as ResourcePageStatus | '')}
        options={[
          { value: '', label: 'All statuses' },
          { value: 'DRAFT', label: 'Draft' },
          { value: 'PUBLISHED', label: 'Published' },
        ]}
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      ) : !pages || pages.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No resource pages yet"
          description="Create one for the books and materials you want guests and new converts to take away."
          action={
            <Link to="/resources/new">
              <Button leftIcon={<Plus className="h-4 w-4" />}>New Page</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => {
            const downloads = page.items.reduce((sum, item) => sum + (item.downloadCount ?? 0), 0);
            return (
              <Link key={page.id} to={`/resources/${page.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="space-y-3 pt-6">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-semibold text-slate-900">{page.title}</h2>
                      <StatusBadge status={page.status} type="event" />
                    </div>
                    <p className="flex items-center gap-1.5 font-mono text-xs text-slate-500">
                      <ExternalLink className="h-3 w-3" />
                      /r/{page.slug}
                    </p>
                    <p className="text-sm text-slate-600">
                      {page.items.length} {page.items.length === 1 ? 'resource' : 'resources'}
                      {downloads > 0 && ` · ${downloads} downloaded`}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
