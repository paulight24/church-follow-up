import * as React from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (opts: Omit<ToastData, 'id'>) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const variantConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-500',
    titleColor: 'text-emerald-900',
    descColor: 'text-emerald-700',
  },
  error: {
    icon: XCircle,
    bg: 'bg-rose-50 border-rose-200',
    iconColor: 'text-rose-500',
    titleColor: 'text-rose-900',
    descColor: 'text-rose-700',
  },
  info: {
    icon: Info,
    bg: 'bg-sky-50 border-sky-200',
    iconColor: 'text-sky-500',
    titleColor: 'text-sky-900',
    descColor: 'text-sky-700',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-900',
    descColor: 'text-amber-700',
  },
} as const;

let idCounter = 0;

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: ToastData;
  onDismiss: (id: string) => void;
}) {
  const config = variantConfig[t.variant];
  const Icon = config.icon;
  const [isExiting, setIsExiting] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(t.id), 200);
    }, 5000);

    return () => clearTimeout(timer);
  }, [t.id, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(t.id), 200);
  };

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-80 items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-200',
        config.bg,
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100',
      )}
      role="alert"
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', config.iconColor)} />
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-medium', config.titleColor)}>
          {t.title}
        </p>
        {t.description && (
          <p className={cn('mt-1 text-sm', config.descColor)}>
            {t.description}
          </p>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className={cn(
          'shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100',
          config.titleColor,
        )}
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = React.useCallback((opts: Omit<ToastData, 'id'>) => {
    const id = `toast-${++idCounter}`;
    setToasts((prev) => [...prev, { ...opts, id }]);
  }, []);

  const ctx = React.useMemo(() => ({ toast: addToast }), [addToast]);

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col gap-2">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within <ToastProvider>');
  }
  return ctx;
}
