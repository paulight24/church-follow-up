import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Modal } from './Modal';
import { Button } from './Button';

const variantConfig = {
  danger: {
    icon: AlertTriangle,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    confirmVariant: 'danger' as const,
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    confirmVariant: 'danger' as const,
  },
  info: {
    icon: Info,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    confirmVariant: 'primary' as const,
  },
} as const;

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: keyof typeof variantConfig;
  className?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  className,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      className={className}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
        <div
          className={cn(
            'mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:mb-0 sm:mr-4',
            config.iconBg,
          )}
        >
          <Icon className={cn('h-6 w-6', config.iconColor)} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm text-slate-600">{message}</p>
        </div>
      </div>
    </Modal>
  );
}
