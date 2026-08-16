import * as React from 'react';
import { cn } from '@/lib/cn';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
  maxLength?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helpText,
      maxLength,
      rows = 4,
      className,
      id,
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    // useId is called unconditionally: `id ?? React.useId()` short-circuits,
    // so the hook ran only for fields WITHOUT an explicit id. A form that
    // mixes both kinds changes its hook count between renders, which is
    // what React forbids. Generating an unused id costs nothing.
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const [charCount, setCharCount] = React.useState(
      typeof value === 'string' ? value.length : 0,
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    React.useEffect(() => {
      if (typeof value === 'string') {
        setCharCount(value.length);
      }
    }, [value]);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          className={cn(
            'w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors',
            'placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'resize-y',
            error
              ? 'border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-500/30'
              : 'border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/30',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
            className,
          )}
          {...props}
        />
        <div className="mt-1.5 flex items-start justify-between gap-2">
          <div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            {!error && helpText && (
              <p className="text-sm text-slate-500">{helpText}</p>
            )}
          </div>
          {maxLength != null && (
            <p
              className={cn(
                'ml-auto shrink-0 text-sm',
                charCount > maxLength ? 'text-rose-600' : 'text-slate-400',
              )}
            >
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
