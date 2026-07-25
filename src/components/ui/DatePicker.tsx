import * as React from 'react';
import { cn } from '@/lib/cn';

interface DatePickerProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helpText?: string;
  min?: string;
  max?: string;
  className?: string;
  disabled?: boolean;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  (
    { label, value, onChange, error, helpText, min, max, className, disabled },
    ref,
  ) => {
    const inputId = React.useId();

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
        <input
          ref={ref}
          id={inputId}
          type="date"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          min={min}
          max={max}
          disabled={disabled}
          className={cn(
            'h-10 w-full rounded-lg border bg-white px-3 text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-500/30'
              : 'border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/30',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
            className,
          )}
        />
        {error && <p className="mt-1.5 text-sm text-rose-600">{error}</p>}
        {!error && helpText && (
          <p className="mt-1.5 text-sm text-slate-500">{helpText}</p>
        )}
      </div>
    );
  },
);

DatePicker.displayName = 'DatePicker';
