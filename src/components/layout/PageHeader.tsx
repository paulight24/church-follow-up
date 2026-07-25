import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** @deprecated Use `subtitle` instead */
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  const subText = subtitle ?? description;

  return (
    <div className={cn('space-y-1', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
            <li>
              <Link
                to="/"
                className="flex items-center transition-colors hover:text-slate-700"
              >
                <Home className="h-3.5 w-3.5" />
              </Link>
            </li>

            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <li key={crumb.label} className="flex items-center gap-1">
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                  {isLast || !crumb.href ? (
                    <span
                      className={cn(
                        isLast
                          ? 'font-medium text-slate-700'
                          : 'text-slate-500',
                      )}
                    >
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.href}
                      className="transition-colors hover:text-slate-700"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* Title row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-slate-900">{title}</h1>
          {subText && (
            <p className="mt-1 text-sm text-slate-500">{subText}</p>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
