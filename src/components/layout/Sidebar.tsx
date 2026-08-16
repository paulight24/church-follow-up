import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarHeart,
  ChevronsLeft,
  ChevronsRight,
  ClipboardCheck,
  FileEdit,
  FileText,
  GraduationCap,
  HandHeart,
  Heart,
  Languages,
  LayoutDashboard,
  LayoutTemplate,
  Megaphone,
  Newspaper,
  Phone,
  Repeat,
  Settings,
  Shield,
  UserCircle2,
  UserCog,
  Users,
  UsersRound,
  Globe2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuth } from '@/hooks/useAuth';
import { AccordionItem } from '@/components/ui/Accordion';

/** OR-match: the user needs at least one of the listed codes. */
type PermissionRequirement = string | string[];

interface NavChild {
  label: string;
  path: string;
  permission?: PermissionRequirement;
}

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  permission?: PermissionRequirement;
  children?: NavChild[];
}

interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

/** Items that always sit above the collapsible sections, unaffected by permissions. */
const topLevelItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  // Every role including MEMBER holds announcements.view - this is one of
  // very few pages an ordinary member can see, so it sits at the top level
  // rather than inside a collapsible section a member has no reason to open.
  { label: 'Announcements', path: '/announcements', icon: Newspaper, permission: 'announcements.view' },
  { label: 'Guide', path: '/guide', icon: BookOpen },
  { label: 'My Profile', path: '/profile', icon: UserCircle2, permission: 'profile.view_own' },
];

const navSections: NavSection[] = [
  {
    id: 'my-work',
    label: 'My Work',
    items: [
      {
        label: 'My Follow-Ups',
        path: '/follow-ups',
        icon: ClipboardCheck,
        permission: ['follow_ups.view', 'follow_ups.view_own'],
      },
      {
        label: 'Follow-Up Cycles',
        path: '/follow-ups/cycles',
        icon: Repeat,
        permission: 'follow_ups.manage_cycles',
      },
      { label: 'Notifications', path: '/notifications', icon: Bell, permission: 'notifications.view' },
    ],
  },
  {
    id: 'people',
    label: 'People',
    items: [
      {
        label: 'Members',
        path: '/members',
        icon: Users,
        permission: 'members.view',
        children: [
          { label: 'List', path: '/members', permission: 'members.view' },
          { label: 'Import', path: '/members/import', permission: 'members.import' },
          { label: 'Duplicates', path: '/members/duplicates', permission: 'members.merge_duplicates' },
        ],
      },
      { label: 'Teams', path: '/teams', icon: UsersRound, permission: 'teams.view' },
      { label: 'Departments', path: '/admin/departments', icon: Building2, permission: 'departments.view' },
      {
        label: 'Cell Groups',
        path: '/admin/fellowship-groups',
        icon: HandHeart,
        permission: 'fellowship_groups.view',
      },
      // Households has no page yet (see report) - omitted to avoid a dead link.
    ],
  },
  {
    id: 'gatherings',
    label: 'Gatherings',
    items: [
      {
        label: 'Services & Attendance',
        path: '/services',
        icon: CalendarCheck,
        permission: 'services.view',
        children: [
          { label: 'All Services', path: '/services', permission: 'services.view' },
          { label: 'Attendance Reports', path: '/services/reports', permission: 'attendance.view_reports' },
        ],
      },
      {
        label: 'Foundation School',
        path: '/foundation-school',
        icon: GraduationCap,
        permission: 'foundation_school.view',
      },
      { label: 'Events', path: '/events', icon: CalendarHeart, permission: 'events.view' },
    ],
  },
  {
    id: 'care',
    label: 'Care',
    items: [
      { label: 'Escalations', path: '/escalations', icon: AlertTriangle, permission: 'escalations.view' },
      { label: 'Prayer Requests', path: '/prayer-requests', icon: HandHeart, permission: 'prayer_requests.view' },
      { label: 'Call Guides', path: '/call-guides', icon: Phone, permission: 'call_guides.view' },
    ],
  },
  {
    id: 'communications',
    label: 'Communications',
    items: [
      {
        label: 'Live Translation',
        path: '/live-translation',
        icon: Languages,
        permission: ['live_translation.view', 'live_translation.manage'],
        children: [
          { label: 'Run a service', path: '/live-translation', permission: ['live_translation.view', 'live_translation.manage'] },
          { label: 'Past services', path: '/live-translation/history', permission: ['live_translation.view', 'live_translation.manage'] },
          { label: 'Settings', path: '/live-translation/settings', permission: ['live_translation.configure', 'live_translation.manage'] },
        ],
      },
      { label: 'Campaigns', path: '/campaigns', icon: Megaphone, permission: 'campaigns.view' },
      { label: 'Encouragements', path: '/encouragements', icon: Heart, permission: 'encouragements.view' },
      {
        label: 'Card Templates',
        path: '/encouragements/cards/manage',
        icon: LayoutTemplate,
        permission: 'encouragement_cards.edit',
      },
      {
        label: 'Manage Announcements',
        path: '/announcements/manage',
        icon: FileEdit,
        permission: 'announcements.create',
      },
    ],
  },
  {
    id: 'insights',
    label: 'Insights',
    items: [
      { label: 'Reports', path: '/reports', icon: BarChart3, permission: 'reports.view' },
      { label: 'Audit Logs', path: '/admin/audit-logs', icon: FileText, permission: 'audit.view' },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    items: [
      { label: 'Users', path: '/admin/users', icon: UserCog, permission: 'users.view' },
      { label: 'Roles', path: '/admin/roles', icon: Shield, permission: 'roles.view' },
      {
        label: 'Service Schedules',
        path: '/admin/service-schedules',
        icon: CalendarClock,
        permission: 'services.manage_schedules',
      },
      { label: 'Settings', path: '/admin/settings', icon: Settings, permission: 'system.settings' },
      // platform.admin is exempt from the church SUPER_ADMIN bypass, so this
      // renders only for genuine SaaS operators.
      { label: 'Platform Console', path: '/admin/platform', icon: Globe2, permission: 'platform.admin' },
    ],
  },
];

function hasRequiredPermission(
  hasPermission: (code: string) => boolean,
  requirement: PermissionRequirement | undefined,
): boolean {
  if (!requirement) return true;
  const codes = Array.isArray(requirement) ? requirement : [requirement];
  return codes.some((code) => hasPermission(code));
}

function isPathActive(pathname: string, itemPath: string): boolean {
  if (itemPath === '/') return pathname === '/';
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

/** Reads/writes a set of open accordion ids from sessionStorage so state
 * survives a Sidebar remount on route change, seeded with whichever id
 * contains the current route on first render. */
function useExpandedIds(storageKey: string, initialId: string | null) {
  const [expanded, setExpandedState] = useState<Set<string>>(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) return new Set(JSON.parse(raw) as string[]);
    } catch {
      // sessionStorage unavailable (private mode, disabled storage) - fall through
    }
    return new Set(initialId ? [initialId] : []);
  });

  const persist = (next: Set<string>) => {
    setExpandedState(next);
    try {
      sessionStorage.setItem(storageKey, JSON.stringify([...next]));
    } catch {
      // best-effort only
    }
  };

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    persist(next);
  };

  const ensureOpen = (id: string) => {
    if (!expanded.has(id)) persist(new Set(expanded).add(id));
  };

  return { expanded, toggle, ensureOpen };
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const activeStyles = 'bg-indigo-50 text-indigo-700 font-medium border-l-3 border-indigo-700';
const inactiveStyles =
  'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-3 border-transparent';

function NavLinkRow({
  to,
  label,
  icon: Icon,
  active,
  collapsed,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        active ? activeStyles : inactiveStyles,
        collapsed && 'justify-center px-2',
      )}
      title={label}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

function NavChildRow({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        'block rounded-md px-3 py-1.5 text-sm transition-colors',
        active ? 'font-medium text-indigo-700' : 'text-slate-500 hover:text-slate-900',
      )}
    >
      {label}
    </Link>
  );
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { hasPermission } = useAuth();
  const location = useLocation();

  // Which item (top-level, section item, or a section item's own children)
  // currently contains the active route - used to seed default-open state.
  const { activeSectionId, activeItemPath } = useMemo(() => {
    for (const section of navSections) {
      for (const item of section.items) {
        const childActive = item.children?.some((child) => isPathActive(location.pathname, child.path));
        if (childActive || isPathActive(location.pathname, item.path)) {
          return { activeSectionId: section.id, activeItemPath: childActive ? item.path : null };
        }
      }
    }
    return { activeSectionId: null as string | null, activeItemPath: null as string | null };
  }, [location.pathname]);

  const sections = useExpandedIds('sidebar.expandedSections', activeSectionId);
  const items = useExpandedIds('sidebar.expandedItems', activeItemPath);

  // Auto-expand (never auto-collapse) whichever section/item holds the
  // active route, so navigating in from elsewhere (not just the initial
  // mount) still reveals the current page without disturbing any other
  // section the user has manually opened or closed.
  useEffect(() => {
    if (activeSectionId) sections.ensureOpen(activeSectionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSectionId]);

  useEffect(() => {
    if (activeItemPath) items.ensureOpen(activeItemPath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeItemPath]);

  const filterChild = (child: NavChild) => hasRequiredPermission(hasPermission, child.permission);
  const filterItem = (item: NavItem) => hasRequiredPermission(hasPermission, item.permission);

  const visibleTopLevelItems = topLevelItems.filter(filterItem);

  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items
        .filter(filterItem)
        .map((item) => ({
          ...item,
          children: item.children?.filter(filterChild),
        })),
    }))
    .filter((section) => section.items.length > 0);

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
        <div className="space-y-0.5">
          {visibleTopLevelItems.map((item) => (
            <NavLinkRow
              key={item.path}
              to={item.path}
              label={item.label}
              icon={item.icon}
              active={isPathActive(location.pathname, item.path)}
              collapsed={collapsed}
            />
          ))}
        </div>

        {collapsed
          ? // Icon rail: no room for section headers or sub-menus - render
            // every visible item as a flat list, same as before this rewrite.
            visibleSections.map((section) => (
              <div key={section.id} className="mt-2">
                <div className="mx-auto mb-2 w-6 border-t border-slate-200" />
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <NavLinkRow
                      key={item.path}
                      to={item.path}
                      label={item.label}
                      icon={item.icon}
                      active={isPathActive(location.pathname, item.path)}
                      collapsed={collapsed}
                    />
                  ))}
                </div>
              </div>
            ))
          : visibleSections.map((section) => (
              <div key={section.id} className="mt-2">
                <AccordionItem
                  id={`section-${section.id}`}
                  isOpen={sections.expanded.has(section.id)}
                  onToggle={() => sections.toggle(section.id)}
                  title={
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {section.label}
                    </span>
                  }
                  className="border-0"
                  headerClassName="rounded-lg px-3 py-2 hover:bg-slate-50"
                  panelClassName="px-0 pb-1 pt-1"
                >
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const hasChildren = (item.children?.length ?? 0) > 0;
                      const childActive = item.children?.some((child) =>
                        isPathActive(location.pathname, child.path),
                      );
                      const itemActive = isPathActive(location.pathname, item.path);

                      if (hasChildren) {
                        return (
                          <AccordionItem
                            key={item.path}
                            id={`item-${item.path}`}
                            isOpen={items.expanded.has(item.path)}
                            onToggle={() => items.toggle(item.path)}
                            title={
                              <span
                                className={cn(
                                  'flex min-w-0 flex-1 items-center gap-3 text-sm',
                                  itemActive || childActive ? 'font-medium text-indigo-700' : 'text-slate-600',
                                )}
                              >
                                <item.icon className="h-5 w-5 shrink-0" />
                                <span className="truncate">{item.label}</span>
                              </span>
                            }
                            className="border-0"
                            headerClassName={cn(
                              'rounded-lg px-3 py-2',
                              itemActive || childActive ? 'bg-indigo-50' : 'hover:bg-slate-50',
                            )}
                            panelClassName="px-0 pb-1 pt-1"
                          >
                            <div className="ml-8 space-y-0.5 border-l border-slate-200 pl-3">
                              {item.children!.map((child) => (
                                <NavChildRow
                                  key={child.path}
                                  to={child.path}
                                  label={child.label}
                                  active={location.pathname === child.path}
                                />
                              ))}
                            </div>
                          </AccordionItem>
                        );
                      }

                      return (
                        <NavLinkRow
                          key={item.path}
                          to={item.path}
                          label={item.label}
                          icon={item.icon}
                          active={itemActive}
                          collapsed={false}
                        />
                      );
                    })}
                  </div>
                </AccordionItem>
              </div>
            ))}
      </nav>

      {/* Toggle button */}
      <div className="shrink-0 border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
