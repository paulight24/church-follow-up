import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  BookOpen,
  ClipboardCheck,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { notificationsApi } from '@/features/notifications/api/notifications.api';
import { useAuth } from '@/hooks/useAuth';

/** OR-match: the user needs at least one of the listed codes. */
type PermissionRequirement = string | string[];

interface MobileNavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  useBadge?: boolean;
  permission?: PermissionRequirement;
}

// Mirrors the permission codes used in Sidebar.tsx for the same
// destinations, so a tab is never shown here if the equivalent desktop nav
// link (and the route itself) would be hidden/forbidden for the same user.
const mobileNavItems: MobileNavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Guide', path: '/guide', icon: BookOpen },
  {
    label: 'Follow-Ups',
    path: '/follow-ups',
    icon: ClipboardCheck,
    permission: ['follow_ups.view', 'follow_ups.view_own'],
  },
  { label: 'Members', path: '/members', icon: Users, permission: 'members.view' },
  { label: 'Notifications', path: '/notifications', icon: Bell, useBadge: true, permission: 'notifications.view' },
  { label: 'Settings', path: '/admin/settings', icon: Settings, permission: 'system.settings' },
];

export function MobileNav() {
  const { hasPermission } = useAuth();
  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsApi.getUnreadCount().then((res) => res.data.meta.total),
    refetchInterval: 30000,
  });

  const visibleItems = mobileNavItems.filter((item) => {
    if (!item.permission) return true;
    const codes = Array.isArray(item.permission) ? item.permission : [item.permission];
    return codes.some((code) => hasPermission(code));
  });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-center justify-around">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const badge = item.useBadge ? (unreadCount ?? 0) : 0;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors',
                  isActive ? 'text-indigo-600' : 'text-slate-400',
                )
              }
            >
              <span className="relative">
                <Icon className="h-5 w-5" />
                {badge > 0 && (
                  <span className="absolute -right-1.5 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-semibold text-white">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
