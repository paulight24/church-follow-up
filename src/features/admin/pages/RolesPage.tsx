import { Shield, Heart, Settings, Users, Phone, Eye } from 'lucide-react';
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface RoleCard {
  id: string;
  name: string;
  description: string;
  permissionCount: number;
  icon: ReactNode;
}

const ROLES: RoleCard[] = [
  {
    id: 'super-admin',
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    permissionCount: 17,
    icon: <Shield className="h-8 w-8 text-indigo-500" />,
  },
  {
    id: 'pastor',
    name: 'Pastor',
    description: 'Senior pastoral access with member care oversight',
    permissionCount: 14,
    icon: <Heart className="h-8 w-8 text-indigo-500" />,
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Administrative access for system management',
    permissionCount: 12,
    icon: <Settings className="h-8 w-8 text-indigo-500" />,
  },
  {
    id: 'team-lead',
    name: 'Team Lead',
    description: 'Team management with follow-up oversight',
    permissionCount: 8,
    icon: <Users className="h-8 w-8 text-indigo-500" />,
  },
  {
    id: 'follow-up-worker',
    name: 'Follow-Up Worker',
    description: 'Follow-up task execution and member contact',
    permissionCount: 5,
    icon: <Phone className="h-8 w-8 text-indigo-500" />,
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to basic information',
    permissionCount: 3,
    icon: <Eye className="h-8 w-8 text-indigo-500" />,
  },
];

export function RolesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Manage access control for your organization"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ROLES.map((role) => (
          <Card key={role.id}>
            <CardContent>
              <div className="mb-3">{role.icon}</div>
              <CardTitle className="mb-1">{role.name}</CardTitle>
              <p className="mb-4 text-sm text-slate-500">{role.description}</p>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="gray" size="sm">
                  {role.permissionCount} permissions
                </Badge>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => alert(`Permissions for: ${role.name}`)}
              >
                View Permissions
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
