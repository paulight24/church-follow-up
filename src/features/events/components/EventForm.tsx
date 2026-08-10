import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { ImageAttachmentPicker } from '@/features/encouragements/components/ImageAttachmentPicker';
import { WYSIWYGEditor } from '@/features/campaigns/components/WYSIWYGEditor';
import type { MediaAssetSummary } from '@/types/encouragement';
import type { EventFieldConfig } from '@/types/event';
import { defaultEventFieldConfig, hasAnyEnabledField } from '../lib/eventFields';
import { EventFieldConfigEditor } from './EventFieldConfigEditor';
import { EventFormPreview } from './EventFormPreview';

function toDateInputValue(iso?: string | null): string {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
}

function toLocalInputValue(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Mirrors the backend's slugSchema regex exactly (events.validation.ts) - lowercase
// letters, digits, hyphens only, no leading/trailing/double hyphen.
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Turns an event name into a candidate slug - collapses anything non-alphanumeric into a single hyphen. */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const eventFormSchema = z.object({
  name: z.string().min(1, 'Event name is required').max(200),
  slug: z
    .string()
    .min(1, 'A URL slug is required')
    .max(150)
    .regex(SLUG_RE, 'Lowercase letters, numbers, and hyphens only (e.g. "recreation-day-2026")'),
  eventDate: z.string().min(1, 'Event date is required'),
  startTime: z.string().refine((v) => !v || TIME_RE.test(v), { message: 'Use HH:mm (24-hour)' }),
  endTime: z.string().refine((v) => !v || TIME_RE.test(v), { message: 'Use HH:mm (24-hour)' }),
  location: z.string().max(200),
  capacity: z
    .string()
    .refine((v) => !v || (/^\d+$/.test(v) && Number(v) > 0), { message: 'Capacity must be a positive whole number' }),
  registrationOpensAt: z.string(),
  registrationClosesAt: z.string(),
});

type EventFormFields = z.infer<typeof eventFormSchema>;

export interface EventFormValues {
  name: string;
  slug: string;
  description: string;
  heroImageAsset: MediaAssetSummary | null;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: string;
  registrationOpensAt: string;
  registrationClosesAt: string;
  fields: EventFieldConfig;
}

interface EventFormProps {
  initialValues?: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
  submitLabel?: string;
}

/**
 * Shared create/edit form (mirrors the MemberForm / MemberCreatePage-EditPage split).
 * react-hook-form + zod cover the plain fields; the WYSIWYG description, hero image, and
 * field-configuration toggles are richer widgets held in local state and merged into the
 * submitted payload alongside the validated fields, the same mixing pattern EscalationForm
 * uses for its member picker.
 */
export function EventForm({ initialValues, onSubmit, isSubmitting, onCancel, submitLabel = 'Save Event' }: EventFormProps) {
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [heroImageAsset, setHeroImageAsset] = useState<MediaAssetSummary | null>(initialValues?.heroImageAsset ?? null);
  const [fields, setFields] = useState<EventFieldConfig>(initialValues?.fields ?? defaultEventFieldConfig());
  const [fieldsError, setFieldsError] = useState<string | null>(null);
  // Once the admin edits the slug directly, stop auto-deriving it from the name - otherwise
  // a deliberate custom slug would keep getting silently overwritten while they keep typing.
  const [slugTouched, setSlugTouched] = useState(!!initialValues?.slug);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventFormFields>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      slug: initialValues?.slug ?? '',
      eventDate: toDateInputValue(initialValues?.eventDate),
      startTime: initialValues?.startTime ?? '',
      endTime: initialValues?.endTime ?? '',
      location: initialValues?.location ?? '',
      capacity: initialValues?.capacity ?? '',
      registrationOpensAt: toLocalInputValue(initialValues?.registrationOpensAt),
      registrationClosesAt: toLocalInputValue(initialValues?.registrationClosesAt),
    },
  });

  const nameValue = watch('name');
  const slugValue = watch('slug');

  function handleFormSubmit(values: EventFormFields) {
    if (!hasAnyEnabledField(fields)) {
      setFieldsError('Turn on at least one field so people have something to fill in.');
      return;
    }
    setFieldsError(null);
    onSubmit({ ...values, description, heroImageAsset, fields });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Event Details</h2>
        <div className="space-y-4">
          <Input
            label="Event Name"
            placeholder="Recreation Day"
            error={errors.name?.message}
            {...register('name', {
              onChange: (e) => {
                if (!slugTouched) setValue('slug', slugify(e.target.value));
              },
            })}
          />

          <div>
            <Input
              label="URL Slug"
              placeholder="recreation-day-2026"
              helpText={`Public link: ${window.location.origin}/e/${slugValue || '...'}`}
              error={errors.slug?.message}
              {...register('slug', { onChange: () => setSlugTouched(true) })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input label="Event Date" type="date" error={errors.eventDate?.message} {...register('eventDate')} />
            <Input
              label="Start Time (optional)"
              type="time"
              error={errors.startTime?.message}
              {...register('startTime')}
            />
            <Input label="End Time (optional)" type="time" error={errors.endTime?.message} {...register('endTime')} />
          </div>

          <Input label="Location (optional)" placeholder="Church Grounds" {...register('location')} />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
            <WYSIWYGEditor content={description} onChange={setDescription} />
          </div>

          <ImageAttachmentPicker value={heroImageAsset} onChange={setHeroImageAsset} disabled={isSubmitting} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Registration Window & Capacity</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Registration opens (optional)"
            type="datetime-local"
            helpText="Leave blank to open registration immediately"
            {...register('registrationOpensAt')}
          />
          <Input
            label="Registration closes (optional)"
            type="datetime-local"
            helpText="Leave blank to keep registration open indefinitely"
            {...register('registrationClosesAt')}
          />
        </div>
        <div className="mt-4 sm:w-1/2 sm:pr-2">
          <Input
            label="Capacity (optional)"
            type="number"
            min={1}
            placeholder="e.g. 150"
            helpText="Leave blank for unlimited spots"
            error={errors.capacity?.message}
            {...register('capacity')}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Registration Fields</h2>
        <p className="mb-4 text-sm text-slate-500">
          Choose what to ask registrants for, and which of those answers are required. The preview updates as you go.
        </p>
        {fieldsError && (
          <Alert variant="error" className="mb-4">
            {fieldsError}
          </Alert>
        )}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <EventFieldConfigEditor value={fields} onChange={setFields} disabled={isSubmitting} />
          <EventFormPreview eventName={nameValue} fields={fields} />
        </div>
      </section>

      {!hasAnyEnabledField(fields) && (
        <Alert variant="warning">
          No fields are turned on yet - registrants won&apos;t be able to submit anything until at least one is.
        </Alert>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
