import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  Building2,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardCheck,
  FileText,
  GraduationCap,
  HandHeart,
  Heart,
  LayoutDashboard,
  Megaphone,
  Phone,
  Settings,
  Shield,
  UserCog,
  Users,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuth } from '@/hooks/useAuth';

interface NavChild {
  label: string;
  path: string;
}

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  permission?: string;
  children?: NavChild[];
}

interface NavSection {
  header?: string;
  headerPermission?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      { label: 'My Follow-Ups', path: '/follow-ups', icon: ClipboardCheck },
      {
        label: 'Members',
        path: '/members',
        icon: Users,
        permission: 'members.view',
        children: [
          { label: 'List', path: '/members' },
          { label: 'Import', path: '/members/import' },
          { label: 'Duplicates', path: '/members/duplicates' },
        ],
      },
      { label: 'Teams', path: '/teams', icon: UsersRound, permission: 'teams.view' },
      {
        label: 'Escalations',
        path: '/escalations',
        icon: AlertTriangle,
        permission: 'escalations.view',
      },
    ],
  },
  {
    header: 'Communications',
    items: [
      {
        label: 'Campaigns',
        path: '/campaigns',
        icon: Megaphone,
        permission: 'campaigns.view',
      },
      { label: 'Encouragements', path: '/encouragements', icon: Heart },
    ],
  },
  {
    items: [
      { label: 'Prayer Requests', path: '/prayer-requests', icon: HandHeart },
      { label: 'Foundation School', path: '/foundation-school', icon: GraduationCap },
      { label: 'Reports', path: '/reports', icon: BarChart3, permission: 'reports.view' },
    ],
  },
  {
    header: 'Administration',
    headerPermission: 'admin.*',
    items: [
      { label: 'Users', path: '/admin/users', icon: UserCog, permission: 'admin.users' },
      { label: 'Roles', path: '/admin/roles', icon: Shield, permission: 'admin.roles' },
      {
        label: 'Settings',
        path: '/admin/settings',
        icon: Settings,
        permission: 'admin.settings',
      },
      {
        label: 'Departments',
        path: '/admin/departments',
        icon: Building2,
        permission: 'admin.departments',
      },
      {
        label: 'Fellowship Groups',
        path: '/admin/fellowship-groups',
        icon: Users,
        permission: 'admin.fellowship-groups',
      },
      {
        label: 'Audit Logs',
        path: '/admin/audit-logs',
        icon: FileText,
        permission: 'admin.audit',
      },
      { label: 'Call Guides', path: '/call-guides', icon: Phone },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function hasPermissionMatch(
  hasPermission: (code: string) => boolean,
  permission: string,
): boolean {
  if (permission.endsWith('.*')) {
    const prefix = permission.slice(0, -2);
    // For wildcard permissions like "admin.*", check if user has any permission starting with prefix
    // We check common sub-permissions as a heuristic
    const subPerms = ['users', 'roles', 'settings', 'audit'];
    return subPerms.some((sub) => hasPermission(`${prefix}.${sub}`));
  }
  return hasPermission(permission);
}

function NavItemLink({
  item,
  collapsed,
  isActive,
  isChildActive,
}: {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
  isChildActive: boolean;
}) {
  const [expanded, setExpanded] = useState(isActive || isChildActive);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;
  const location = useLocation();

  const activeStyles =
    'bg-indigo-50 text-indigo-700 font-medium border-l-3 border-indigo-700';
  const inactiveStyles =
    'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-3 border-transparent';

  if (hasChildren && !collapsed) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
            isActive || isChildActive ? activeStyles : inactiveStyles,
          )}
          title={item.label}
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span className="flex-1 truncate text-left">{item.label}</span>
          {expanded ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
          )}
        </button>

        {expanded && (
          <div className="ml-8 mt-1 space-y-0.5 border-l border-slate-200 pl-3">
            {item.children!.map((child) => {
              const childActive = location.pathname === child.path;
              return (
                <Link
                  key={child.path}
                  to={child.path}
                  className={cn(
                    'block rounded-md px-3 py-1.5 text-sm transition-colors',
                    childActive
                      ? 'font-medium text-indigo-700'
                      : 'text-slate-500 hover:text-slate-900',
                  )}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.path}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        isActive ? activeStyles : inactiveStyles,
        collapsed && 'justify-center px-2',
      )}
      title={item.label}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { hasPermission } = useAuth();
  const location = useLocation();

  const filterItem = (item: NavItem): boolean => {
    if (!item.permission) return true;
    return hasPermissionMatch(hasPermission, item.permission);
  };

  const filterSection = (section: NavSection): boolean => {
    if (section.headerPermission) {
      if (!hasPermissionMatch(hasPermission, section.headerPermission)) return false;
    }
    return section.items.some(filterItem);
  };

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col border-r border-slate-200 bg-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-slate-100 px-4',
          collapsed && 'justify-center px-2',
        )}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600">
            <Heart className="h-4.5 w-4.5 text-white" fill="white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Member Care
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navSections.filter(filterSection).map((section, sectionIndex) => {
          const visibleItems = section.items.filter(filterItem);
          if (visibleItems.length === 0) return null;

          return (
            <div key={sectionIndex} className={cn(sectionIndex > 0 && 'mt-6')}>
              {section.header && !collapsed && (
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {section.header}
                </h3>
              )}
              {collapsed && section.header && (
                <div className="mx-auto mb-2 w-6 border-t border-slate-200" />
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive =
                    item.path === '/'
                      ? location.pathname === '/'
                      : location.pathname === item.path;
                  const isChildActive =
                    item.children?.some((child) => location.pathname === child.path) ??
                    false;

                  return (
                    <NavItemLink
                      key={item.path + item.label}
                      item={item}
                      collapsed={collapsed}
                      isActive={isActive && !isChildActive}
                      isChildActive={isChildActive}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Toggle button */}
      <div className="shrink-0 border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'flex w-full items-center justify-center rounded-lg py-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600',
            !collapsed && 'gap-2',
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronsRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronsLeft className="h-5 w-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
