import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, Settings, User } from 'lucide-react';
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  const userDisplayName = user
    ? `${user.firstName} ${user.lastName}`
    : 'User';

  const primaryRoleLabel = user?.roles[0]?.name ?? 'Member';

  const userMenuItems: DropdownItem[] = [
    {
      label: 'Profile',
      icon: <User />,
      onClick: () => navigate('/profile'),
    },
    {
      label: 'Settings',
      icon: <Settings />,
      onClick: () => navigate('/settings'),
    },
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
      {/* Left: Mobile hamburger */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden"
          aria-label="Toggle mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Center/Right */}
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        {/* Global search */}
        <SearchInput
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Search members, teams..."
          className="hidden w-64 lg:block xl:w-80"
        />

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
    </header>
  );
}
