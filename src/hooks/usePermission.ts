import { useAuth } from './useAuth';

export function usePermission(permission: string): boolean {
  const { user } = useAuth();
  if (!user) return false;
  if (user.roles.some((r) => r.code === 'SUPER_ADMIN')) return true;
  return user.permissions.includes(permission);
}
