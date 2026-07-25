import type { Team } from '@/types/team';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { TeamCard } from '../components/TeamCard';
import { Plus } from 'lucide-react';

const MOCK_TEAMS: Team[] = [
  {
    id: '1',
    name: 'Zone A Follow-Up',
    description: 'Handles follow-up for members and visitors in Zone A (Lekki, Ajah, VI)',
    leaderId: 'l1',
    leader: { id: 'l1', firstName: 'Pastor', lastName: 'Adeyemi', email: 'adeyemi@church.org' },
    memberCount: 8,
    isActive: true,
    createdAt: '2025-11-01T08:00:00Z',
    updatedAt: '2026-07-20T09:00:00Z',
  },
  {
    id: '2',
    name: 'Zone B Follow-Up',
    description: 'Covers Ikeja, Ogba, Maryland and surrounding areas',
    leaderId: 'l2',
    leader: { id: 'l2', firstName: 'Deaconess', lastName: 'Okafor', email: 'okafor@church.org' },
    memberCount: 6,
    isActive: true,
    createdAt: '2025-11-15T08:00:00Z',
    updatedAt: '2026-07-18T14:00:00Z',
  },
  {
    id: '3',
    name: 'New Members Care',
    description: 'Dedicated to welcoming and integrating new members into the church family',
    leaderId: 'l3',
    leader: { id: 'l3', firstName: 'Sister', lastName: 'Nnamdi', email: 'nnamdi@church.org' },
    memberCount: 5,
    isActive: true,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-07-22T11:00:00Z',
  },
  {
    id: '4',
    name: 'Youth Ministry',
    description: 'Follow-up team for young adults and campus fellowship members',
    leaderId: 'l4',
    leader: { id: 'l4', firstName: 'Brother', lastName: 'Oladipo', email: 'oladipo@church.org' },
    memberCount: 7,
    isActive: true,
    createdAt: '2026-02-05T08:00:00Z',
    updatedAt: '2026-07-21T16:00:00Z',
  },
  {
    id: '5',
    name: "Women's Ministry",
    description: 'Sisters caring for sisters through consistent follow-up and fellowship',
    leaderId: 'l5',
    leader: { id: 'l5', firstName: 'Deaconess', lastName: 'Abiodun', email: 'abiodun@church.org' },
    memberCount: 9,
    isActive: true,
    createdAt: '2025-12-01T08:00:00Z',
    updatedAt: '2026-07-23T08:30:00Z',
  },
  {
    id: '6',
    name: "Men's Fellowship",
    description: 'Brotherhood follow-up team for men and fathers in the congregation',
    leaderId: 'l6',
    leader: { id: 'l6', firstName: 'Elder', lastName: 'Eze', email: 'eze@church.org' },
    memberCount: 4,
    isActive: false,
    createdAt: '2026-03-20T08:00:00Z',
    updatedAt: '2026-06-15T10:00:00Z',
  },
];

const MOCK_STATS: Record<string, { assignedCount: number; completionRate: number }> = {
  '1': { assignedCount: 24, completionRate: 83 },
  '2': { assignedCount: 18, completionRate: 72 },
  '3': { assignedCount: 15, completionRate: 90 },
  '4': { assignedCount: 20, completionRate: 68 },
  '5': { assignedCount: 30, completionRate: 77 },
  '6': { assignedCount: 8, completionRate: 45 },
};

export function TeamListPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams"
        description="Manage follow-up teams"
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            Create Team
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_TEAMS.map((team) => {
          const stats = MOCK_STATS[team.id];
          return (
            <TeamCard
              key={team.id}
              team={team}
              assignedCount={stats?.assignedCount}
              completionRate={stats?.completionRate}
            />
          );
        })}
      </div>
    </div>
  );
}
