import type { EventFieldConfig, EventFieldKey, EventFieldToggle } from '@/types/event';
import { EVENT_FIELD_DEFS } from '../lib/eventFields';

interface EventFieldConfigEditorProps {
  value: EventFieldConfig;
  onChange: (next: EventFieldConfig) => void;
  disabled?: boolean;
}

/**
 * Lets the church toggle each catalogue field on/off and mark it required for this event.
 * Paired with <EventRegistrationFields> (rendered live next to this in EventForm) so the
 * effect of every click is visible immediately, rather than the admin having to imagine
 * what the public form will look like.
 */
export function EventFieldConfigEditor({ value, onChange, disabled }: EventFieldConfigEditorProps) {
  function setToggle(key: EventFieldKey, patch: Partial<EventFieldToggle>) {
    onChange({
      ...value,
      [key]: { ...value[key], ...patch },
    });
  }

  return (
    <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
      <div className="grid grid-cols-[1fr,auto,auto] gap-4 bg-slate-50 px-4 py-2 text-xs font-medium uppercase tracking-wider text-slate-500">
        <span>Field</span>
        <span className="w-16 text-center">Show</span>
        <span className="w-20 text-center">Required</span>
      </div>
      {EVENT_FIELD_DEFS.map((def) => {
        const toggle = value[def.key];
        return (
          <div key={def.key} className="grid grid-cols-[1fr,auto,auto] items-center gap-4 px-4 py-2.5">
            <span className="text-sm text-slate-700">{def.label}</span>
            <span className="flex w-16 justify-center">
              <input
                type="checkbox"
                checked={toggle.enabled}
                disabled={disabled}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  setToggle(def.key, { enabled, required: enabled ? toggle.required : false });
                }}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                aria-label={`Show ${def.label} field`}
              />
            </span>
            <span className="flex w-20 justify-center">
              <input
                type="checkbox"
                checked={toggle.required}
                disabled={disabled || !toggle.enabled}
                onChange={(e) => setToggle(def.key, { required: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-30"
                aria-label={`Require ${def.label} field`}
              />
            </span>
          </div>
        );
      })}
    </div>
  );
}
