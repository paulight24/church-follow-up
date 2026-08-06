import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, ShieldOff, Settings2, X, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { formatRelativeDate } from '@/lib/formatters';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { usersApi } from '../api/users.api';
import type { AdminUserListItem } from '../api/users.api';
import { rolesApi } from '../api/roles.api';

const PAGE_SIZE = 15;

const statusVariant: Record<string, 'success' | 'info' | 'warning' | 'gray'> = {
  ACTIVE: 'success',
  INVITED: 'info',
  SUSPENDED: 'warning',
  DEACTIVATED: 'gray',
};

const roleVariant: Record<string, 'default' | 'purple' | 'danger' | 'warning' | 'info' | 'gray'> = {
  SUPER_ADMIN: 'danger',
  PASTOR: 'purple',
  ADMINISTRATOR: 'default',
  TEAM_LEAD: 'warning',
  FOLLOW_UP_WORKER: 'info',
  COMMUNICATIONS_MANAGER: 'info',
  AUDITOR: 'gray',
  VIEWER: 'gray',
};

const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Invited', value: 'INVITED' },
  { label: 'Suspended', value: 'SUSPENDED' },
  { label: 'Deactivated', value: 'DEACTIVATED' },
];

const scopeTypeOptions = [
  { label: 'Global', value: 'GLOBAL' },
  { label: 'Team', value: 'TEAM' },
  { label: 'Department', value: 'DEPARTMENT' },
];

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Backend: POST /users and POST /users/:id/resend-invite both require
  // users.create; POST/DELETE /users/:id/roles require users.manage_roles;
  // POST /users/:id/deactivate requires users.deactivate (see
  // backend/src/modules/users/users.routes.ts).
  const canCreateUsers = usePermission('users.create');
  const canManageRoles = usePermission('users.manage_roles');
  const canDeactivateUsers = usePermission('users.deactivate');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [manageRolesUserId, setManageRolesUserId] = useState<string | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<AdminUserListItem | null>(null);
  const [resendingUserId, setResendingUserId] = useState<string | null>(null);

  const resendInviteMutation = useMutation({
    mutationFn: (id: string) => usersApi.resendInvite(id),
    onMutate: (id) => setResendingUserId(id),
    onSuccess: () => {
      toast({ title: 'Invite resent', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({ title: 'Could not resend invite', description: message, variant: 'error' });
    },
    onSettled: () => setResendingUserId(null),
  });

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', { page, search, status }],
    queryFn: () =>
      usersApi
        .getUsers({ page, pageSize: PAGE_SIZE, search: search || undefined, status: (status || undefined) as never })
        .then((res) => res.data),
  });

  const rolesQuery = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => rolesApi.getRoles().then((res) => res.data),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => usersApi.deactivateUser(id),
    onSuccess: () => {
      toast({ title: 'User deactivated', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setDeactivateTarget(null);
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({ title: 'Could not deactivate user', description: message, variant: 'error' });
    },
  });

  const users = usersQuery.data?.data ?? [];
  const meta = usersQuery.data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage system users and their role assignments"
        actions={
          canCreateUsers ? (
            <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setIsCreateOpen(true)}>
              Add User
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by name or email..."
          className="sm:max-w-xs"
        />
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={statusOptions}
          className="sm:max-w-[180px]"
        />
      </div>

      {usersQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : usersQuery.isError ? (
        <EmptyState title="Failed to load users" description="Please try again shortly." />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" description="Try adjusting your search or filters." />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const name = `${u.firstName} ${u.lastName}`;
                const isSelf = u.id === currentUser?.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={name} size="sm" />
                        <span className="font-medium text-slate-900">{name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {u.roles.length === 0 ? (
                          <span className="text-xs text-slate-400">No roles</span>
                        ) : (
                          u.roles.map((r) => (
                            <Badge key={`${r.id}-${r.scopeType}-${r.scopeId ?? 'global'}`} variant={roleVariant[r.code] ?? 'gray'} size="sm">
                              {r.name}
                              {r.scopeType !== 'GLOBAL' ? ` (${r.scopeType.toLowerCase()})` : ''}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[u.status] ?? 'gray'} dot size="sm">
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-slate-500">
                      {u.lastLoginAt ? formatRelativeDate(u.lastLoginAt) : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {canCreateUsers && u.status === 'INVITED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                            isLoading={resendingUserId === u.id}
                            onClick={() => resendInviteMutation.mutate(u.id)}
                          >
                            Resend
                          </Button>
                        )}
                        {canManageRoles && (
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Settings2 className="h-3.5 w-3.5" />}
                            onClick={() => setManageRolesUserId(u.id)}
                          >
                            Roles
                          </Button>
                        )}
                        {canDeactivateUsers && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isSelf || u.status === 'DEACTIVATED'}
                            title={isSelf ? "You cannot deactivate your own account" : undefined}
                            onClick={() => setDeactivateTarget(u)}
                          >
                            <ShieldOff className="h-4 w-4 text-rose-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {meta && meta.totalPages > 1 && (
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              totalItems={meta.total}
              pageSize={meta.limit}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        roles={rolesQuery.data ?? []}
      />

      {manageRolesUserId && (
        <ManageRolesModal userId={manageRolesUserId} onClose={() => setManageRolesUserId(null)} roles={rolesQuery.data ?? []} />
      )}

      <ConfirmDialog
        isOpen={deactivateTarget !== null}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={() => deactivateTarget && deactivateMutation.mutate(deactivateTarget.id)}
        title="Deactivate user"
        message={`Are you sure you want to deactivate ${deactivateTarget?.firstName} ${deactivateTarget?.lastName}? They will immediately lose access to the system.`}
        confirmText="Deactivate"
        variant="danger"
      />
    </div>
  );
}

// ─── Create user modal ──────────────────────────────────────────────────

function CreateUserModal({
  isOpen,
  onClose,
  roles,
}: {
  isOpen: boolean;
  onClose: () => void;
  roles: { id: string; name: string; code: string }[];
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () =>
      usersApi.createUser({
        firstName,
        lastName,
        email,
        password,
        phone: phone || undefined,
        roleIds: roleIds.length ? roleIds : undefined,
      }),
    onSuccess: () => {
      toast({ title: 'User created', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      reset();
      onClose();
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(message ?? 'Failed to create user. Please check the fields and try again.');
    },
  });

  function reset() {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setRoleIds([]);
    setFormError(null);
  }

  function toggleRole(id: string) {
    setRoleIds((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Add User"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            isLoading={createMutation.isPending}
            onClick={() => {
              setFormError(null);
              createMutation.mutate();
            }}
          >
            Create User
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {formError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input
          label="Temporary password"
          type="password"
          helpText="Min 8 characters, with uppercase, lowercase, number, and special character."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input label="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />

        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">Roles</p>
          <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-lg border border-slate-200 p-3">
            {roles.length === 0 ? (
              <p className="text-sm text-slate-400">No roles available</p>
            ) : (
              roles.map((r) => (
                <label key={r.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={roleIds.includes(r.id)}
                    onChange={() => toggleRole(r.id)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  {r.name}
                </label>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── Manage roles modal ─────────────────────────────────────────────────

function ManageRolesModal({
  userId,
  onClose,
  roles,
}: {
  userId: string;
  onClose: () => void;
  roles: { id: string; name: string; code: string }[];
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [scopeType, setScopeType] = useState<'GLOBAL' | 'TEAM' | 'DEPARTMENT'>('GLOBAL');
  const [scopeId, setScopeId] = useState('');

  const userQuery = useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: () => usersApi.getUser(userId).then((res) => res.data),
  });

  const assignMutation = useMutation({
    mutationFn: () =>
      usersApi.assignRole(userId, {
        roleId: selectedRoleId,
        scopeType,
        scopeId: scopeType === 'GLOBAL' ? undefined : scopeId || undefined,
      }),
    onSuccess: () => {
      toast({ title: 'Role assigned', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setSelectedRoleId('');
      setScopeType('GLOBAL');
      setScopeId('');
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({ title: 'Could not assign role', description: message, variant: 'error' });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userRoleId: string) => usersApi.removeRole(userId, userRoleId),
    onSuccess: () => {
      toast({ title: 'Role removed', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({ title: 'Could not remove role', description: message, variant: 'error' });
    },
  });

  const detail = userQuery.data;
  const roleOptions = roles.map((r) => ({ label: r.name, value: r.id }));

  return (
    <Modal isOpen onClose={onClose} title={detail ? `Roles — ${detail.firstName} ${detail.lastName}` : 'Manage Roles'} size="lg">
      {userQuery.isLoading || !detail ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Current roles</p>
            {detail.roles.length === 0 ? (
              <p className="text-sm text-slate-400">No roles assigned</p>
            ) : (
              <div className="space-y-2">
                {detail.roles.map((r) => (
                  <div
                    key={r.userRoleId}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{r.name}</p>
                      <p className="text-xs text-slate-500">
                        {r.scopeType}
                        {r.scopeId ? ` · ${r.scopeId}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMutation.mutate(r.userRoleId)}
                      className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label={`Remove ${r.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4">
            <p className="mb-2 text-sm font-medium text-slate-700">Assign a new role</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Select
                placeholder="Select role"
                options={roleOptions}
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
              />
              <Select
                options={scopeTypeOptions}
                value={scopeType}
                onChange={(e) => setScopeType(e.target.value as 'GLOBAL' | 'TEAM' | 'DEPARTMENT')}
              />
              {scopeType !== 'GLOBAL' ? (
                <Input placeholder="Scope ID" value={scopeId} onChange={(e) => setScopeId(e.target.value)} />
              ) : (
                <div />
              )}
            </div>
            <Button
              className="mt-3"
              size="sm"
              disabled={!selectedRoleId}
              isLoading={assignMutation.isPending}
              onClick={() => assignMutation.mutate()}
            >
              Assign Role
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
