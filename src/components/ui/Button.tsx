import * as React from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

const variantClasses = {
  primary:
    'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm focus-visible:ring-indigo-500',
  secondary:
    'bg-slate-100 hover:bg-slate-200 text-slate-900 shadow-sm focus-visible:ring-slate-400',
  outline:
    'border border-slate-300 hover:bg-slate-50 text-slate-700 focus-visible:ring-indigo-500',
  ghost:
    'hover:bg-slate-100 text-slate-700 focus-visible:ring-indigo-500',
  danger:
    'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus-visible:ring-rose-500',
} as const;

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
} as const;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {isLoading && <Spinner size="sm" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span className={cn(isLoading && 'opacity-70')}>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
