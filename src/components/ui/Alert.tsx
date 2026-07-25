import type { ReactNode } from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/cn';

const variantConfig = {
  info: {
    icon: Info,
    classes: 'bg-sky-50 border-sky-200 text-sky-800',
    iconClass: 'text-sky-500',
  },
  success: {
    icon: CheckCircle,
    classes: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    iconClass: 'text-emerald-500',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'bg-amber-50 border-amber-200 text-amber-800',
    iconClass: 'text-amber-500',
  },
  error: {
    icon: XCircle,
    classes: 'bg-rose-50 border-rose-200 text-rose-800',
    iconClass: 'text-rose-500',
  },
} as const;

interface AlertProps {
  variant?: keyof typeof variantConfig;
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export function Alert({
  variant = 'info',
  title,
  children,
  onDismiss,
  className,
}: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 rounded-lg border p-4',
        config.classes,
        className,
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', config.iconClass)} />
      <div className="flex-1">
        {title && <p className="mb-1 font-medium">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
