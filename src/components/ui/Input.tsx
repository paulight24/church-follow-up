import * as React from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const sizeClasses = {
  sm: 'h-8 text-sm px-3',
  md: 'h-10 text-sm px-3',
  lg: 'h-12 text-base px-4',
} as const;

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: keyof typeof sizeClasses;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helpText,
      leftIcon,
      rightIcon,
      size = 'md',
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? React.useId();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-lg border bg-white transition-colors',
              'placeholder:text-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              error
                ? 'border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-500/30'
                : 'border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/30',
              'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
              sizeClasses[size],
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-rose-600">{error}</p>}
        {!error && helpText && (
          <p className="mt-1.5 text-sm text-slate-500">{helpText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
