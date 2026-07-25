import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Heart, Settings, Users, Phone, Eye, Plus, Lock } from 'lucide-react';
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { usePermission } from '@/hooks/usePermission';
import { rolesApi } from '../api/roles.api';
import type { AdminRole, AdminPermission } from '../api/roles.api';

const roleIcons: Record<string, ReactNode> = {
  SUPER_ADMIN: <Shield className="h-8 w-8 text-indigo-500" />,
  PASTOR: <Heart className="h-8 w-8 text-indigo-500" />,
  ADMINISTRATOR: <Settings className="h-8 w-8 text-indigo-500" />,
  TEAM_LEAD: <Users className="h-8 w-8 text-indigo-500" />,
  FOLLOW_UP_WORKER: <Phone className="h-8 w-8 text-indigo-500" />,
  VIEWER: <Eye className="h-8 w-8 text-indigo-500" />,
};

function iconForRole(code: string): ReactNode {
  return roleIcons[code] ?? <Shield className="h-8 w-8 text-indigo-500" />;
}

export function RolesPage() {
  const canManage = usePermission('roles.manage');
  const [permissionsRole, setPermissionsRole] = useState<AdminRole | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const rolesQuery = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => rolesApi.getRoles().then((res) => res.data),
  });

  const roles = rolesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Manage access control for your organization"
        actions={
          canManage ? (
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsCreateOpen(true)}>
              New Role
            </Button>
          ) : undefined
        }
      />

      {rolesQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : roles.length === 0 ? (
        <EmptyState title="No roles found" description="No roles have been configured yet." />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardContent>
                <div className="mb-3 flex items-start justify-between">
                  {iconForRole(role.code)}
                  {role.isSystemRole && (
                    <span title="System role — cannot be renamed or removed">
                      <Lock className="h-4 w-4 text-slate-300" />
                    </span>
                  )}
                </div>
                <CardTitle className="mb-1">{role.name}</CardTitle>
                <p className="mb-4 text-sm text-slate-500">
                  {role.description || 'No description provided.'}
                </p>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Badge variant="gray" size="sm">
                    {role.rolePermissions.length} permissions
                  </Badge>
                  <Badge variant="default" size="sm">
                    {role._count.userRoles} {role._count.userRoles === 1 ? 'user' : 'users'}
                  </Badge>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setPermissionsRole(role)}>
                  {canManage ? 'Edit Permissions' : 'View Permissions'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {permissionsRole && (
        <RolePermissionsModal
          role={permissionsRole}
          canManage={canManage}
          onClose={() => setPermissionsRole(null)}
        />
      )}

      {canManage && <CreateRoleModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />}
    </div>
  );
}

// ─── Permissions checklist modal ────────────────────────────────────────

function groupByCategory(permissions: AdminPermission[]): Record<string, AdminPermission[]> {
  const groups: Record<string, AdminPermission[]> = {};
  for (const p of permissions) {
    if (!groups[p.category]) groups[p.category] = [];
    groups[p.category].push(p);
  }
  return groups;
}

function RolePermissionsModal({
  role,
  canManage,
  onClose,
}: {
  role: AdminRole;
  canManage: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const permissionsQuery = useQuery({
    queryKey: ['admin', 'permissions'],
    queryFn: () => rolesApi.getPermissions().then((res) => res.data),
    enabled: canManage,
  });

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(role.rolePermissions.map((rp) => rp.permission.id)),
  );

  useEffect(() => {
    setSelected(new Set(role.rolePermissions.map((rp) => rp.permission.id)));
  }, [role]);

  const saveMutation = useMutation({
    mutationFn: () => rolesApi.setRolePermissions(role.id, Array.from(selected)),
    onSuccess: () => {
      toast({ title: 'Permissions updated', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
      onClose();
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({ title: 'Could not update permissions', description: message, variant: 'error' });
    },
  });

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Read-only viewers (no roles.manage) see only the role's currently-assigned
  // permissions, since GET /users/permissions/list itself requires roles.manage.
  const grouped = canManage && permissionsQuery.data
    ? groupByCategory(permissionsQuery.data)
    : groupByCategory(role.rolePermissions.map((rp) => rp.permission as AdminPermission));

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`${role.name} — Permissions`}
      size="lg"
      footer={
        canManage ? (
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              isLoading={saveMutation.isPending}
              disabled={role.isSystemRole}
              onClick={() => saveMutation.mutate()}
            >
              Save Changes
            </Button>
          </div>
        ) : undefined
      }
    >
      {canManage && permissionsQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-1">
          {role.isSystemRole && canManage && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              This is a system role and cannot be modified.
            </p>
          )}
          {Object.entries(grouped).map(([category, perms]) => (
            <div key={category}>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {category}
              </h4>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {perms.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      disabled={!canManage || role.isSystemRole}
                      onChange={() => toggle(p.id)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      {p.name}
                      <span className="ml-1 text-xs text-slate-400">({p.code})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

// ─── Create role modal ──────────────────────────────────────────────────

function CreateRoleModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () => rolesApi.createRole({ name, code, description: description || undefined }),
    onSuccess: () => {
      toast({ title: 'Role created', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
      reset();
      onClose();
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? 'Failed to create role.');
    },
  });

  function reset() {
    setName('');
    setCode('');
    setDescription('');
    setError(null);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      title="New Role"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button isLoading={createMutation.isPending} onClick={() => createMutation.mutate()}>
            Create Role
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <Input label="Role name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Regional Coordinator" />
        <Input
          label="Role code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. REGIONAL_COORDINATOR"
          helpText="Uppercase letters, numbers, and underscores only."
        />
        <Textarea label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>
    </Modal>
  );
}
