import { Pin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/formatters';
import { mediaAssetUrl } from '@/features/campaigns/api/campaigns.api';
import type { Announcement } from '@/types/announcement';

interface AnnouncementCardProps {
  announcement: Announcement;
  className?: string;
}

/**
 * The congregation-facing card - welcoming rather than administrative.
 * Pinned items get a visually distinct amber ring/badge; everything else is
 * plain and calm so the content (not the chrome) carries the page.
 */
export function AnnouncementCard({ announcement, className }: AnnouncementCardProps) {
  const { title, body, imageAsset, isPinned, publishAt } = announcement;

  return (
    <Card
      className={cn(
        'flex flex-col transition-shadow hover:shadow-md',
        isPinned && 'ring-2 ring-amber-300',
        className,
      )}
    >
      {imageAsset && (
        <img
          src={mediaAssetUrl(imageAsset)}
          alt=""
          className="h-48 w-full shrink-0 object-cover"
        />
      )}

      <div className="flex flex-1 flex-col gap-3 p-6">
        {isPinned && (
          <Badge variant="warning" size="sm" dot className="w-fit">
            <Pin className="h-3 w-3" />
            Pinned
          </Badge>
        )}

        <h3 className="text-lg font-semibold leading-snug text-slate-900">{title}</h3>

        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{body}</p>

        <p className="mt-auto pt-2 text-xs font-medium text-slate-400">{formatDate(publishAt)}</p>
      </div>
    </Card>
  );
}
