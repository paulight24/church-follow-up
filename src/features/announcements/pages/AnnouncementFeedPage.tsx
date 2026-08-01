import { useQuery } from '@tanstack/react-query';
import { Megaphone } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { announcementsApi } from '../api/announcements.api';
import { AnnouncementCard } from '../components/AnnouncementCard';

/**
 * The congregation-facing feed - deliberately welcoming rather than
 * administrative, since this is the one page most MEMBER-role users will
 * actually spend time on. Same query key as WhatsHappeningWidget on the
 * Dashboard, so arriving here via "See all" is instant from cache.
 */
export function AnnouncementFeedPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['announcements', 'feed'],
    queryFn: () => announcementsApi.getFeed().then((res) => res.data),
  });

  const announcements = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Announcements" subtitle="What's happening in the church, and what to expect" />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      ) : isError ? (
        <p className="py-16 text-center text-sm text-rose-600">
          Could not load announcements right now. Please try again shortly.
        </p>
      ) : announcements.length === 0 ? (
        <Card>
          <EmptyState
            icon={Megaphone}
            title="Nothing posted yet"
            description="When there's something new to share with the church, it will show up here."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {announcements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      )}
    </div>
  );
}
