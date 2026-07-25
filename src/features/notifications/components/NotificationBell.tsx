import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { notificationsApi } from '../api/notifications.api';
import { NotificationCenter } from './NotificationCenter';

interface NotificationBellProps {
  /** Optional override - if omitted, the bell fetches and polls the real unread count. */
  count?: number;
  /** If provided, clicking the bell calls this instead of opening the built-in panel. */
  onClick?: () => void;
  className?: string;
}

export function NotificationBell({ count, onClick, className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsApi.getUnreadCount().then((res) => res.data.meta.total),
    refetchInterval: 30000,
    enabled: count === undefined,
  });

  const displayCount = count ?? data ?? 0;
  const displayLabel = displayCount > 99 ? '99+' : String(displayCount);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleClick() {
    if (onClick) {
      onClick();
      return;
    }
    setIsOpen((prev) => !prev);
  }

  return (
    <div className={className} ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={handleClick}
        className="relative rounded-lg p-2 transition hover:bg-slate-100"
        aria-label={`Notifications${displayCount > 0 ? ` (${displayCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5 text-slate-600" />
        {displayCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-medium text-white">
            {displayLabel}
          </span>
        )}
      </button>

      {isOpen && !onClick && (
        <div className="absolute right-0 top-full z-50 mt-2">
          <NotificationCenter />
        </div>
      )}
    </div>
  );
}
