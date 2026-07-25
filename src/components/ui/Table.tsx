import type { ReactNode, HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

export function Table({ className, children, ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn('w-full border-collapse text-left', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

interface TableSectionProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export function TableHeader({ className, children, ...props }: TableSectionProps) {
  return (
    <thead className={cn('bg-slate-50', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }: TableSectionProps) {
  return (
    <tbody className={cn('divide-y divide-slate-100', className)} {...props}>
      {children}
    </tbody>
  );
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
}

export function TableRow({ className, children, ...props }: TableRowProps) {
  return (
    <tr
      className={cn(
        'border-b border-slate-100 transition-colors hover:bg-slate-50',
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
}

export function TableHead({ className, children, ...props }: TableHeadProps) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500',
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
}

export function TableCell({ className, children, ...props }: TableCellProps) {
  return (
    <td
      className={cn('px-4 py-3 text-sm text-slate-700', className)}
      {...props}
    >
      {children}
    </td>
  );
}

interface TableEmptyProps {
  colSpan: number;
  message?: string;
  icon?: ReactNode;
  className?: string;
}

export function TableEmpty({
  colSpan,
  message = 'No data available',
  icon,
  className,
}: TableEmptyProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={cn('px-4 py-12 text-center', className)}
      >
        <div className="flex flex-col items-center gap-2">
          {icon && (
            <span className="text-slate-300">{icon}</span>
          )}
          <p className="text-sm text-slate-500">{message}</p>
        </div>
      </td>
    </tr>
  );
}
