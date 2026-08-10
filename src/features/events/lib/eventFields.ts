import { z } from 'zod';
import {
  EVENT_FIELD_KEYS,
  type EventFieldConfig,
  type EventFieldKey,
  type EventFieldToggle,
} from '@/types/event';

type FieldInputType = 'text' | 'email' | 'tel' | 'date' | 'textarea';

export interface EventFieldDef {
  key: EventFieldKey;
  label: string;
  inputType: FieldInputType;
  placeholder?: string;
}

/**
 * The fixed catalogue of fields a church can toggle on/off per event, in the order
 * they're rendered on both the public registration form and the admin config/preview UI.
 * This is the single source of truth for labels + input types - the public form, the
 * admin field-config editor, and the live preview all read from this list rather than
 * each hardcoding their own copy.
 */
export const EVENT_FIELD_DEFS: EventFieldDef[] = [
  { key: 'firstName', label: 'First Name', inputType: 'text', placeholder: 'Grace' },
  { key: 'lastName', label: 'Last Name', inputType: 'text', placeholder: 'Adeyemi' },
  { key: 'email', label: 'Email', inputType: 'email', placeholder: 'grace@example.com' },
  { key: 'phone', label: 'Phone', inputType: 'tel', placeholder: '+234...' },
  { key: 'dateOfBirth', label: 'Date of Birth', inputType: 'date' },
  { key: 'weddingAnniversary', label: 'Wedding Anniversary', inputType: 'date' },
  {
    key: 'prayerRequest',
    label: 'Tell us how we can pray for you',
    inputType: 'textarea',
    placeholder: 'Share anything you would like the team to pray with you about (optional)...',
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A sensible starting point when creating a new event: first/last name required, nothing else on. */
export function defaultEventFieldConfig(): EventFieldConfig {
  return EVENT_FIELD_KEYS.reduce((acc, key) => {
    acc[key] = { enabled: key === 'firstName' || key === 'lastName', required: key === 'firstName' || key === 'lastName' };
    return acc;
  }, {} as EventFieldConfig);
}

/** True if at least one field is enabled - used to block publishing/saving a form nobody can fill in. */
export function hasAnyEnabledField(fields: EventFieldConfig): boolean {
  return EVENT_FIELD_KEYS.some((key) => fields[key]?.enabled);
}

function fieldValidator(def: EventFieldDef, toggle: EventFieldToggle): z.ZodTypeAny {
  let base = z.string().trim();
  if (toggle.required) {
    base = base.min(1, `${def.label} is required`);
  }

  const withFormat: z.ZodTypeAny =
    def.inputType === 'email'
      ? base.refine((v) => v === '' || EMAIL_RE.test(v), { message: 'Enter a valid email address' })
      : base;

  return toggle.required ? withFormat : withFormat.optional().default('');
}

/**
 * Builds the Zod schema for a registration form from an event's live field configuration.
 * Only enabled fields get a schema entry at all, so `Object.keys(parsed)` naturally matches
 * "only the fields this event asks for" - exactly what the backend rejects deviation from.
 * Building this dynamically (rather than one fixed schema) is deliberate: a hardcoded schema
 * would drift the moment a church toggles a field, producing confusing client-side rejections
 * that don't match what the server actually requires.
 */
export type RegistrationFormValues = Record<string, string>;

export function buildRegistrationSchema(
  fields: EventFieldConfig,
): z.ZodType<RegistrationFormValues, RegistrationFormValues> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const def of EVENT_FIELD_DEFS) {
    const toggle = fields[def.key];
    if (toggle?.enabled) {
      shape[def.key] = fieldValidator(def, toggle);
    }
  }
  // z.object's inferred output type for a dynamically-keyed shape widens to Record<string,
  // unknown>; every branch of fieldValidator always yields a string (required or
  // default('')), so this cast just tells TS what's already true at runtime.
  return z.object(shape) as unknown as z.ZodType<RegistrationFormValues, RegistrationFormValues>;
}

/** Default form values for the enabled fields only - keeps every registered field a controlled input. */
export function defaultRegistrationValues(fields: EventFieldConfig): RegistrationFormValues {
  const values: RegistrationFormValues = {};
  for (const def of EVENT_FIELD_DEFS) {
    if (fields[def.key]?.enabled) {
      values[def.key] = '';
    }
  }
  return values;
}

/**
 * GET /public/events/:slug only sends the enabled subset as a `{key, required}[]` (see
 * PublicEvent in src/types/event.ts) rather than the full admin-shaped EventFieldConfig
 * map - this adapts that list back into the same EventFieldConfig shape so the public page
 * can reuse buildRegistrationSchema/defaultRegistrationValues/<EventRegistrationFields>
 * unchanged instead of maintaining a second, list-shaped code path.
 */
export function publicFieldsToConfig(fields: Array<{ key: EventFieldKey; required: boolean }>): EventFieldConfig {
  const config = {} as EventFieldConfig;
  for (const key of EVENT_FIELD_KEYS) {
    const match = fields.find((f) => f.key === key);
    config[key] = { enabled: !!match, required: match?.required ?? false };
  }
  return config;
}
