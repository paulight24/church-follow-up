import { useForm } from 'react-hook-form';
import type { EventFieldConfig } from '@/types/event';
import { defaultRegistrationValues } from '../lib/eventFields';
import type { RegistrationFormValues } from '../lib/eventFields';
import { EventRegistrationFields } from './EventRegistrationFields';

interface EventFormPreviewInnerProps {
  fields: EventFieldConfig;
}

function EventFormPreviewInner({ fields }: EventFormPreviewInnerProps) {
  const {
    register,
    formState: { errors },
  } = useForm<RegistrationFormValues>({ defaultValues: defaultRegistrationValues(fields) });

  return <EventRegistrationFields fields={fields} register={register} errors={errors} disabled />;
}

interface EventFormPreviewProps {
  eventName: string;
  fields: EventFieldConfig;
}

/**
 * Live preview of the public registration form, rendered through the exact same
 * <EventRegistrationFields> component the real /e/:slug page uses - so what shows here is
 * what a registrant will actually see, not a lookalike that can drift. Keyed on the field
 * config so toggling a checkbox remounts the inert preview form with the new set of fields.
 */
export function EventFormPreview({ eventName, fields }: EventFormPreviewProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Preview - what registrants will see
      </p>
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-center text-lg font-bold text-slate-900">{eventName || 'Your Event Name'}</h3>
        <EventFormPreviewInner key={JSON.stringify(fields)} fields={fields} />
        <button
          type="button"
          disabled
          className="mt-5 w-full cursor-not-allowed rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white opacity-60"
        >
          Register
        </button>
      </div>
    </div>
  );
}
