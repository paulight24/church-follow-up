import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Megaphone, Pin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { formatDate } from '@/lib/formatters';
import { mediaAssetUrl } from '@/features/campaigns/api/campaigns.api';
import { announcementsApi } from '@/features/announcements/api/announcements.api';

const MAX_ITEMS = 3;

/**
 * "What's happening" - the Dashboard's compact window into the congregation
 * feed. Uses the same query key as AnnouncementFeedPage so navigating there
 * via "See all" is instant from cache. For a MEMBER (whose Dashboard has
 * almost nothing else to show - see DashboardPage's permission gates) this
 * is deliberately styled to look like a real, intentional feature rather
 * than a leftover placeholder.
 */
export function WhatsHappeningWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['announcements', 'feed'],
    queryFn: () => announcementsApi.getFeed().then((res) => res.data),
  });

  const items = (data ?? []).slice(0, MAX_ITEMS);

  return (
    <Card>
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Megaphone className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">What&apos;s Happening</h3>
        </div>
        <Link
          to="/announcements"
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
        >
          See all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="text-indigo-600" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="Nothing posted yet"
            description="Church announcements will show up here as soon as there's something new to share."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <Link
                key={item.id}
                to="/announcements"
                className="-mx-2 flex gap-3 rounded-lg px-2 py-3 transition-colors first:pt-0 last:pb-0 hover:bg-slate-50"
              >
                {item.imageAsset ? (
                  <img
                    src={mediaAssetUrl(item.imageAsset)}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-400">
                    <Megaphone className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {item.isPinned && (
                      <Badge variant="warning" size="sm" dot>
                        <Pin className="h-2.5 w-2.5" />
                        Pinned
                      </Badge>
                    )}
                    <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{item.body}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDate(item.publishAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
