import { Lock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { AnnouncementAudience } from '@/types/announcement';

/**
 * Deliberately verbose rather than a plain <Select>-style label: the whole
 * point (see Sidebar/routes report) is that STAFF_ONLY vs ALL must never be
 * mistaken for one another at a glance, since a mis-click here means an
 * internal note reaches the whole congregation or vice versa.
 */
const AUDIENCE_COPY: Record<AnnouncementAudience, { label: string; icon: typeof Users }> = {
  ALL: { label: 'Everyone, including members', icon: Users },
  STAFF_ONLY: { label: 'Staff only', icon: Lock },
};

interface AudienceBadgeProps {
  audience: AnnouncementAudience;
  className?: string;
}

export function AudienceBadge({ audience, className }: AudienceBadgeProps) {
  const { label, icon: Icon } = AUDIENCE_COPY[audience];
  return (
    <Badge variant={audience === 'STAFF_ONLY' ? 'purple' : 'success'} dot className={className}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
