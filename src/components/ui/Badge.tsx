import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const variantClasses = {
  default: 'bg-indigo-100 text-indigo-800',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-rose-100 text-rose-800',
  info: 'bg-sky-100 text-sky-800',
  purple: 'bg-purple-100 text-purple-800',
  gray: 'bg-slate-100 text-slate-600',
} as const;

const dotColorClasses = {
  default: 'bg-indigo-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  purple: 'bg-purple-500',
  gray: 'bg-slate-400',
} as const;

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
} as const;

interface BadgeProps {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotColorClasses[variant])}
        />
      )}
      {children}
    </span>
  );
}
