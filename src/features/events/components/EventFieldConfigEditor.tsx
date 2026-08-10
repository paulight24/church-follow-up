import type { EventFieldConfig, EventFieldKey, EventFieldToggle } from '@/types/event';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { EVENT_FIELD_DEFS, defaultEventFieldConfig } from '../lib/eventFields';

interface EventFieldConfigEditorProps {
  value: EventFieldConfig;
  onChange: (next: EventFieldConfig) => void;
  disabled?: boolean;
}

// Fields turned on (and required) by defaultEventFieldConfig() - surfaced as a
// "Recommended" hint so an admin knows which fields a new event starts with and thinks
// twice before switching them off, rather than discovering an empty registration form
// only after publishing.
const RECOMMENDED_DEFAULTS = defaultEventFieldConfig();

/**
 * Lets the church toggle each catalogue field on/off and mark it required for this event.
 * Paired with <EventRegistrationFields> (rendered live next to this in EventForm) so the
 * effect of every click is visible immediately, rather than the admin having to imagine
 * what the public form will look like.
 *
 * Each row carries its own "Show" / "Required" text labels glued to their checkboxes,
 * rather than relying on a shared column header above the list. The previous version used
 * a bare CSS grid (`grid-cols-[1fr,auto,auto]`) with the labels only in a header row - a
 * stray comma in that Tailwind arbitrary value (it needed underscores: `1fr_auto_auto`)
 * produced invalid CSS that browsers silently discard, so the grid never applied and every
 * row rendered as an unlabeled vertical stack of two identical-looking checkboxes. Keeping
 * the label attached to its own control means a row can never lose that meaning, at any
 * width, regardless of what the surrounding layout does.
 */
export function EventFieldConfigEditor({ value, onChange, disabled }: EventFieldConfigEditorProps) {
  function setToggle(key: EventFieldKey, patch: Partial<EventFieldToggle>) {
    onChange({
      ...value,
      [key]: { ...value[key], ...patch },
    });
  }

  const enabledCount = EVENT_FIELD_DEFS.filter((def) => value[def.key]?.enabled).length;

  return (
    <div className="rounded-lg border border-slate-200">
      <div className="flex items-center justify-between gap-2 rounded-t-lg border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Registration Fields
        </span>
        <span
          className={cn(
            'text-xs font-medium',
            enabledCount === 0 ? 'text-rose-600' : 'text-slate-500',
          )}
        >
          {enabledCount} of {EVENT_FIELD_DEFS.length} shown
        </span>
      </div>
      <ul className="divide-y divide-slate-100">
        {EVENT_FIELD_DEFS.map((def) => {
          const toggle: EventFieldToggle = value[def.key] ?? { enabled: false, required: false };
          const isRecommended = !!RECOMMENDED_DEFAULTS[def.key]?.enabled;
          const requiredDisabled = disabled || !toggle.enabled;

          return (
            <li
              key={def.key}
              className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3"
            >
              <div className="min-w-[10rem] flex-1">
                <p className="text-sm font-medium text-slate-800">{def.label}</p>
                {isRecommended && (
                  <Badge variant="gray" size="sm" className="mt-1">
                    Recommended
                  </Badge>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1.5">
                <label
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium select-none',
                    disabled ? 'cursor-not-allowed text-slate-400' : 'cursor-pointer text-slate-700',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={toggle.enabled}
                    disabled={disabled}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setToggle(def.key, { enabled, required: enabled ? toggle.required : false });
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed"
                    aria-label={`Show ${def.label} field on the registration form`}
                  />
                  Show
                </label>
                <label
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium select-none',
                    requiredDisabled ? 'cursor-not-allowed text-slate-300' : 'cursor-pointer text-slate-700',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={toggle.required}
                    disabled={requiredDisabled}
                    onChange={(e) => setToggle(def.key, { required: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label={`Require ${def.label} field to be filled in`}
                  />
                  Required
                </label>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
