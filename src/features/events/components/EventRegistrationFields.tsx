import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { EventFieldConfig } from '@/types/event';
import { EVENT_FIELD_DEFS } from '../lib/eventFields';
import type { RegistrationFormValues } from '../lib/eventFields';

interface EventRegistrationFieldsProps {
  fields: EventFieldConfig;
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
export function EventRegistrationFields({ fields, register, errors, disabled }: EventRegistrationFieldsProps) {
  const enabledDefs = EVENT_FIELD_DEFS.filter((def) => fields[def.key]?.enabled);

  if (enabledDefs.length === 0) {
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
    </div>
  );
}
