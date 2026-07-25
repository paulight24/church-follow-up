import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  totalItems?: number;
  className?: string;
}

function getVisiblePages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];

  pages.push(1);

  if (current > 3) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('ellipsis');
  }

  pages.push(total);

  return pages;
}

const pageSizeOptions = [10, 25, 50, 100];

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems,
  className,
}: PaginationProps) {
  const visiblePages = getVisiblePages(currentPage, totalPages);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  const startItem = totalItems != null && pageSize != null
    ? (currentPage - 1) * pageSize + 1
    : null;
  const endItem = totalItems != null && pageSize != null
    ? Math.min(currentPage * pageSize, totalItems)
    : null;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between gap-4 sm:flex-row',
        className,
      )}
    >
      {/* Left: Results info + page size */}
      <div className="flex items-center gap-4 text-sm text-slate-600">
        {totalItems != null && startItem != null && endItem != null && (
          <span>
            Showing{' '}
            <span className="font-medium text-slate-900">{startItem}</span> to{' '}
            <span className="font-medium text-slate-900">{endItem}</span> of{' '}
            <span className="font-medium text-slate-900">{totalItems}</span>{' '}
            results
          </span>
        )}
        {pageSize != null && onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Right: Page navigation */}
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors',
            isFirstPage
              ? 'cursor-not-allowed text-slate-300'
              : 'text-slate-600 hover:bg-slate-100',
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {visiblePages.map((page, idx) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${idx}`}
              className="inline-flex h-9 w-9 items-center justify-center text-sm text-slate-400"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors',
                page === currentPage
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100',
              )}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors',
            isLastPage
              ? 'cursor-not-allowed text-slate-300'
              : 'text-slate-600 hover:bg-slate-100',
          )}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}
