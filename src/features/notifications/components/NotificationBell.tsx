import { Bell } from 'lucide-react';

interface NotificationBellProps {
  count: number;
  onClick?: () => void;
}

export function NotificationBell({ count, onClick }: NotificationBellProps) {
  const displayCount = count > 99 ? '99+' : String(count);

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative rounded-lg p-2 transition hover:bg-slate-100"
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
    >
      <Bell className="h-5 w-5 text-slate-600" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-medium text-white">
          {displayCount}
        </span>
      )}
    </button>
  );
}
