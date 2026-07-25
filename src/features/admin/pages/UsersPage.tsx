import { UserPlus, MoreHorizontal } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';

type RoleName = 'Super Admin' | 'Pastor' | 'Admin' | 'Team Lead' | 'Follow-Up Worker' | 'Viewer';

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

const roleVariant: Record<RoleName, 'default' | 'purple' | 'danger' | 'warning' | 'info' | 'gray'> = {
  'Super Admin': 'default',
  Pastor: 'purple',
  Admin: 'danger',
  'Team Lead': 'warning',
  'Follow-Up Worker': 'info',
  Viewer: 'gray',
};

const MOCK_USERS: MockUser[] = [
  { id: '1', name: 'Pastor David Adeyemi', email: 'david@church.org', role: 'Pastor', status: 'Active', lastLogin: 'Today' },
  { id: '2', name: 'Chioma Eze', email: 'chioma@church.org', role: 'Admin', status: 'Active', lastLogin: 'Yesterday' },
  { id: '3', name: 'Emeka Okafor', email: 'emeka@church.org', role: 'Team Lead', status: 'Active', lastLogin: '2 days ago' },
  { id: '4', name: 'Blessing Nwosu', email: 'blessing@church.org', role: 'Follow-Up Worker', status: 'Active', lastLogin: 'Today' },
  { id: '5', name: 'James Obi', email: 'james@church.org', role: 'Follow-Up Worker', status: 'Active', lastLogin: '3 days ago' },
  { id: '6', name: 'Funke Adebayo', email: 'funke@church.org', role: 'Team Lead', status: 'Active', lastLogin: '1 week ago' },
  { id: '7', name: 'Samuel Ogundele', email: 'samuel@church.org', role: 'Viewer', status: 'Inactive', lastLogin: '1 month ago' },
  { id: '8', name: 'Mary Okoro', email: 'mary@church.org', role: 'Follow-Up Worker', status: 'Active', lastLogin: 'Today' },
];

export function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        actions={
          <Button
            leftIcon={<UserPlus className="h-4 w-4" />}
            onClick={() => alert('Invite user flow coming soon')}
          >
            Invite User
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_USERS.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} size="sm" />
                  <span className="font-medium text-slate-900">{user.name}</span>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={roleVariant[user.role]} size="sm">
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={user.status === 'Active' ? 'success' : 'gray'}
                  dot
                  size="sm"
                >
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap">{user.lastLogin}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert(`Edit user: ${user.name}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => alert(`More options for: ${user.name}`)}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
