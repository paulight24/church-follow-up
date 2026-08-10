import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Church, LogOut, Menu, Search, Settings, User, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown } from '@/components/ui/Dropdown';
import type { DropdownItem } from '@/components/ui/Dropdown';
import { SearchInput } from '@/components/ui/SearchInput';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onMobileMenuToggle: () => void;
}

export function Header({ sidebarCollapsed, onMobileMenuToggle }: HeaderProps) {
  const { user, logout, hasPermission, churches, switchChurch } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);

  const activeChurch = user?.activeChurch;

  const handleSwitchChurch = async (churchId: string) => {
    if (switching || churchId === activeChurch?.id) return;
    setSwitching(true);
    try {
      await switchChurch(churchId);
      navigate('/dashboard');
    } finally {
      setSwitching(false);
    }
  };

  const churchMenuItems: DropdownItem[] = churches.map((church) => ({
    label: church.name,
    icon: church.churchId === activeChurch?.id ? <Check /> : <Church />,
    onClick: () => void handleSwitchChurch(church.churchId),
  }));
  const canSearchMembers = hasPermission('members.view');
  const [searchValue, setSearchValue] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mobileSearchOpen && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value.trim()) {
      navigate(`/members?search=${encodeURIComponent(value.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/members?search=${encodeURIComponent(searchValue.trim())}`);
      setMobileSearchOpen(false);
      setSearchValue('');
    }
  };

  const userDisplayName = user
    ? `${user.firstName} ${user.lastName}`
    : 'User';

  const primaryRoleLabel = user?.roles[0]?.name ?? 'Member';

  const userMenuItems: DropdownItem[] = [
    ...(hasPermission('profile.view_own')
      ? [
          {
            label: 'My Profile',
            icon: <User />,
            onClick: () => navigate('/profile'),
          },
        ]
      : []),
    ...(hasPermission('system.settings')
      ? [
          {
            label: 'Settings',
            icon: <Settings />,
            onClick: () => navigate('/admin/settings'),
          },
        ]
      : []),
    { label: '', divider: true, onClick: () => {} },
    {
      label: 'Logout',
      icon: <LogOut />,
      onClick: logout,
      variant: 'danger',
    },
  ];

  return (
    <header
      className={cn(
        'fixed right-0 top-0 z-20 flex h-16 items-center border-b border-slate-200 bg-white px-4 shadow-sm transition-all duration-300 md:px-6',
        sidebarCollapsed ? 'md:left-16' : 'md:left-64',
        'left-0',
      )}
    >
      {/* Left: Mobile hamburger + active church */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden"
          aria-label="Toggle mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Active church — always visible so nobody acts in the wrong
            church by accident; becomes a switcher when the user belongs to
            more than one. */}
        {activeChurch && (
          churches.length > 1 ? (
            <Dropdown
              trigger={
                <div className="flex min-w-0 cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50">
                  <Church className="h-4 w-4 shrink-0 text-indigo-600" />
                  <span className="truncate text-sm font-medium text-slate-700">{activeChurch.name}</span>
                  {activeChurch.subscriptionStatus === 'LAPSED' && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      DATA ONLY
                    </span>
                  )}
                </div>
              }
              items={churchMenuItems}
              align="left"
            />
          ) : (
            <div className="flex min-w-0 items-center gap-2 px-2 py-1.5">
              <Church className="h-4 w-4 shrink-0 text-indigo-600" />
              <span className="hidden truncate text-sm font-medium text-slate-700 sm:block">{activeChurch.name}</span>
              {activeChurch.subscriptionStatus === 'LAPSED' && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  DATA ONLY
                </span>
              )}
            </div>
          )
        )}
      </div>

      {/* Center/Right */}
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        {/* Desktop search - hidden without members.view, since it only ever
            navigates to /members and would dead-end in a 403 otherwise. */}
        {canSearchMembers && (
        <SearchInput
          value={searchValue}
          onChange={handleSearch}
          placeholder="Search members, teams..."
          className="hidden w-64 lg:block xl:w-80"
        />
        )}

        {/* Mobile search icon */}
        {canSearchMembers && (
        <button
          type="button"
          onClick={() => setMobileSearchOpen(true)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>
        )}

        {/* Notification bell */}
        <NotificationBell className="text-slate-500 hover:text-slate-700" />

        {/* User dropdown */}
        <Dropdown
          trigger={
            <div className="flex items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-slate-50">
              <Avatar
                src={user?.avatarUrl ?? undefined}
                name={userDisplayName}
                size="sm"
              />
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-slate-700">
                  {userDisplayName}
                </p>
                <p className="text-xs text-slate-400">
                  {primaryRoleLabel}
                </p>
              </div>
            </div>
          }
          items={userMenuItems}
          align="right"
        />
      </div>

      {/* Mobile search overlay */}
      {mobileSearchOpen && (
        <div className="absolute inset-0 z-50 flex items-center gap-2 bg-white px-3 lg:hidden">
          <form onSubmit={handleMobileSearchSubmit} className="flex flex-1 items-center gap-2">
            <Search className="h-5 w-5 shrink-0 text-slate-400" />
            <input
              ref={mobileInputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search members, teams..."
              className="h-10 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </form>
          <button
            type="button"
            onClick={() => { setMobileSearchOpen(false); setSearchValue(''); }}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </header>
  );
}
