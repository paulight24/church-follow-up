import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import {
  EVENT_CUSTOM_FIELD_TYPES,
  type EventCustomField,
  type EventCustomFieldType,
} from '@/types/event';

/**
 * Builder for questions that belong to this event only — "Number of adults
 * attending", "Backpack requested", "Children's ages".
 *
 * These are event data: they are recorded against the registration, shown in
 * the registrations list and included in the CSV export, but they never
 * become member fields. The built-in fields above them are the ones that
 * feed follow-up.
 */
const MAX_FIELDS = 15;

const TYPE_LABELS: Record<EventCustomFieldType, string> = {
  text: 'Short text',
  textarea: 'Long text',
  number: 'Number',
  select: 'Choice',
  checkbox: 'Yes / No',
};

interface CustomFieldBuilderProps {
  value: EventCustomField[];
  onChange: (fields: EventCustomField[]) => void;
  disabled?: boolean;
}

export function CustomFieldBuilder({ value, onChange, disabled }: CustomFieldBuilderProps) {
  const update = (index: number, patch: Partial<EventCustomField>) =>
    onChange(value.map((field, i) => (i === index ? { ...field, ...patch } : field)));

  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const add = () =>
    onChange([...value, { key: '', label: '', type: 'text', required: false }]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Questions just for this event</h3>
          <p className="mt-1 text-sm text-slate-500">
            Anything else you need to know — how many are coming, ages, whether they want a
            backpack. Answers appear with each registration and in the CSV export.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={add}
          disabled={disabled || value.length >= MAX_FIELDS}
        >
          Add question
        </Button>
      </div>

      {value.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
          No extra questions. The form will ask only for the fields selected above.
        </p>
      ) : (
        <div className="space-y-3">
          {value.map((field, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <GripVertical className="mt-2.5 h-4 w-4 shrink-0 text-slate-300" aria-hidden="true" />

                <div className="min-w-0 flex-1 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_170px]">
                    <Input
                      label="Question"
                      placeholder="Number of adults attending"
                      value={field.label}
                      onChange={(e) => update(index, { label: e.target.value })}
                      disabled={disabled}
                    />
                    <Select
                      label="Answer type"
                      value={field.type}
                      onChange={(e) =>
                        update(index, {
                          type: e.target.value as EventCustomFieldType,
                          // A choice question needs options; anything else must not carry them.
                          options: e.target.value === 'select' ? (field.options ?? ['']) : undefined,
                        })
                      }
                      disabled={disabled}
                      options={EVENT_CUSTOM_FIELD_TYPES.map((type) => ({
                        value: type,
                        label: TYPE_LABELS[type],
                      }))}
                    />
                  </div>

                  {field.type === 'select' && (
                    <Input
                      label="Choices (comma separated)"
                      placeholder="Yes, No, Maybe"
                      value={(field.options ?? []).join(', ')}
                      onChange={(e) =>
                        update(index, { options: e.target.value.split(',').map((option) => option.trim()) })
                      }
                      disabled={disabled}
                    />
                  )}

                  <Input
                    label="Help text (optional)"
                    placeholder="Shown under the question"
                    value={field.helpText ?? ''}
                    onChange={(e) => update(index, { helpText: e.target.value })}
                    disabled={disabled}
                  />

                  <label className="flex w-fit items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => update(index, { required: e.target.checked })}
                      disabled={disabled}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">Required</span>
                  </label>
                </div>

                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={disabled || index === 0}
                    aria-label="Move question up"
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={disabled || index === value.length - 1}
                    aria-label="Move question down"
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={disabled}
                    aria-label="Remove question"
                    className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {value.length >= MAX_FIELDS && (
        <p className="text-xs text-slate-500">
          That is the maximum of {MAX_FIELDS} questions — a longer form is a form people abandon.
        </p>
      )}
    </div>
  );
}
