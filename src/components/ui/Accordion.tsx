import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

interface AccordionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Generic accordion container. Renders as a list of AccordionItems sharing a
 * bordered card look. State (which items are open) is owned by the caller —
 * pass `isOpen`/`onToggle` to each AccordionItem — so it can be persisted,
 * filtered, or driven by anything (a Set of ids, a single active id, etc).
 */
export function Accordion({ children, className }: AccordionProps) {
  return (
    <div className={cn('divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white', className)}>
      {children}
    </div>
  );
}

interface AccordionItemProps {
  /** Unique id for this item, used to build the header/panel `id`s and ARIA links. */
  id: string;
  /** Header content — rendered inside the toggle button, next to the chevron. */
  title: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  panelClassName?: string;
}

export function AccordionItem({
  id,
  title,
  isOpen,
  onToggle,
  children,
  className,
  headerClassName,
  panelClassName,
}: AccordionItemProps) {
  const buttonId = `accordion-trigger-${id}`;
  const panelId = `accordion-panel-${id}`;

  return (
    <div className={className}>
      <h3 className="contents">
        <button
          type="button"
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className={cn(
            'flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500',
            headerClassName,
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-3">{title}</span>
          <ChevronDown
            aria-hidden="true"
            className={cn('h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180')}
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className={cn('px-5 pb-5 pt-0', panelClassName)}
      >
        {isOpen && children}
      </div>
    </div>
  );
}
