import { NavLink } from 'react-router-dom';
import {
  Bell,
  ClipboardCheck,
  LayoutDashboard,
  MoreHorizontal,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface MobileNavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

const mobileNavItems: MobileNavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Follow-Ups', path: '/follow-ups', icon: ClipboardCheck },
  { label: 'Members', path: '/members', icon: Users },
  { label: 'Notifications', path: '/notifications', icon: Bell, badge: 3 },
  { label: 'More', path: '/admin/settings', icon: MoreHorizontal },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;

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
                {item.badge != null && item.badge > 0 && (
                  <span className="absolute -right-1.5 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-semibold text-white">
                    {item.badge}
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
