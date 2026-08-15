import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import type { EventCustomField, EventFieldConfig } from '@/types/event';
import { EVENT_FIELD_DEFS } from '../lib/eventFields';
import type { RegistrationFormValues } from '../lib/eventFields';

interface EventRegistrationFieldsProps {
  fields: EventFieldConfig;
  /** This event's own questions, rendered after the catalogue fields. */
  customFields?: EventCustomField[];
  register: UseFormRegister<RegistrationFormValues>;
  errors: FieldErrors<RegistrationFormValues>;
  disabled?: boolean;
}

/**
 * Renders only the fields the event's config has enabled, in catalogue order, honouring
 * required/optional. This is the single rendering path shared by the real public
 * registration form and the admin's "live preview" (BUILD 2) - the preview instantiates
 * its own inert react-hook-form and renders through this exact component, so what an admin
 * sees while configuring an event is pixel-for-pixel what a registrant will see, not a
 * hand-maintained lookalike that can drift from it.
 */
export function EventRegistrationFields({
  fields,
  customFields = [],
  register,
  errors,
  disabled,
}: EventRegistrationFieldsProps) {
  const enabledDefs = EVENT_FIELD_DEFS.filter((def) => fields[def.key]?.enabled);
  // react-hook-form nests errors for dotted names, matching `custom.<key>`.
  const customErrors = (errors.custom ?? {}) as Record<string, { message?: string } | undefined>;

  if (enabledDefs.length === 0 && customFields.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
        No fields are turned on for this event yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {enabledDefs.map((def) => {
        const required = fields[def.key]?.required ?? false;
        const label = `${def.label}${required ? ' *' : ''}`;
        const error = errors[def.key]?.message as string | undefined;

        if (def.inputType === 'textarea') {
          return (
            <Textarea
              key={def.key}
              label={label}
              placeholder={def.placeholder}
              rows={4}
              disabled={disabled}
              error={error}
              {...register(def.key)}
            />
          );
        }

        return (
          <Input
            key={def.key}
            label={label}
            type={def.inputType}
            placeholder={def.placeholder}
            disabled={disabled}
            error={error}
            {...register(def.key)}
          />
        );
      })}

      {customFields.map((field) => {
        const name = `custom.${field.key}`;
        const label = `${field.label}${field.required ? ' *' : ''}`;
        const error = customErrors[field.key]?.message;

        if (field.type === 'textarea') {
          return (
            <Textarea
              key={field.key}
              label={label}
              rows={3}
              helpText={field.helpText}
              disabled={disabled}
              error={error}
              {...register(name)}
            />
          );
        }

        if (field.type === 'select') {
          return (
            <Select
              key={field.key}
              label={label}
              helpText={field.helpText}
              disabled={disabled}
              error={error}
              options={[
                { value: '', label: 'Select…' },
                ...(field.options ?? []).map((option) => ({ value: option, label: option })),
              ]}
              {...register(name)}
            />
          );
        }

        if (field.type === 'checkbox') {
          return (
            <div key={field.key}>
              <label className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  value="Yes"
                  disabled={disabled}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  {...register(name)}
                />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
              {field.helpText && <p className="mt-1 pl-7 text-xs text-slate-500">{field.helpText}</p>}
              {error && <p className="mt-1 pl-7 text-xs text-red-600">{error}</p>}
            </div>
          );
        }

        return (
          <Input
            key={field.key}
            label={label}
            type={field.type === 'number' ? 'number' : 'text'}
            helpText={field.helpText}
            disabled={disabled}
            error={error}
            {...register(name)}
          />
        );
      })}
    </div>
  );
}
