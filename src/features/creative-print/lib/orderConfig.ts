/**
 * The vocabulary of a print order, client-side.
 *
 * Everything here mirrors a server rule that would otherwise be discovered
 * as a 400 or, worse, as a wrong charge. The schema mirrors
 * `createQuoteSchema`/`createOrderSchema`; the quantity maths mirrors
 * `assertQuantity`; `fingerprintOf` is what stops a price being shown next
 * to an order it no longer describes.
 */
import { z } from 'zod';
import type {
  FulfillmentType,
  PrintDocument,
  ProviderCapabilities,
  Sides,
  Urgency,
} from '@/types/creativePrint';

/**
 * An untouched optional field arrives as '', and `z.string().email().optional()`
 * rejects that — the empty string is a string, so `.optional()` never applies.
 * The first version of this schema shipped exactly that bug: leaving the
 * optional email blank failed validation, and because the errors rendered on
 * fields nobody had scrolled to, "Place order" appeared to do nothing at all.
 * Blank means absent, here and on the wire.
 */
function optionalText<T extends z.ZodType<string>>(schema: T) {
  // A union rather than z.preprocess (which widens the INPUT type to
  // `unknown`, and react-hook-form's resolver then refuses to reconcile it),
  // and deliberately WITHOUT a transform: a transform turns `line2?: string`
  // into `line2: string | undefined`, a required key, which the resolver
  // rejects just as loudly. Blank stays blank here and is dropped on the way
  // to the wire by `toShippingAddress`.
  return z.union([z.literal(''), schema]).optional();
}

/** Mirrors the server's shippingAddress schema, field for field. */
export const addressSchema = z.object({
  name: z.string().trim().min(1, 'Who should the parcel be addressed to?').max(120),
  line1: z.string().trim().min(1, 'A street address is required').max(200),
  line2: optionalText(z.string().trim().max(200)),
  city: z.string().trim().min(1, 'A city is required').max(120),
  stateOrProvince: z.string().trim().min(2, 'A state or province is required').max(60),
  postalCode: z.string().trim().min(3, 'A postcode is required').max(12),
  // Two letters, uppercase — the server enforces exactly this and rejects
  // "USA" or "United States", which is what a volunteer types first.
  country: z
    .string()
    .trim()
    .length(2, 'Use the two-letter country code, e.g. US')
    .transform((value) => value.toUpperCase()),
  phone: optionalText(z.string().trim().max(40)),
  email: optionalText(z.string().trim().email('That does not look like an email address').max(200)),
});

export type PrintAddress = z.infer<typeof addressSchema>;

/**
 * Form values → what the API accepts.
 *
 * The server's schema rejects `email: ''` as an invalid address, so a blank
 * optional field must be absent rather than empty. Doing it here, at the
 * boundary, keeps the form types simple and the wire payload honest.
 */
export function toShippingAddress(address: PrintAddress) {
  const present = (value: string | undefined) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  };
  return {
    name: address.name.trim(),
    line1: address.line1.trim(),
    line2: present(address.line2),
    city: address.city.trim(),
    stateOrProvince: address.stateOrProvince.trim(),
    postalCode: address.postalCode.trim(),
    country: address.country.trim().toUpperCase(),
    phone: present(address.phone),
    email: present(address.email),
  };
}

/**
 * The form owns the ADDRESS and nothing else.
 *
 * Quantity, paper and urgency are option-card pickers held in component
 * state, because each one re-prices the order the moment it changes. Listing
 * them here too would mean two sources of truth for the same values — and
 * the first version of this file did exactly that, so the resolver failed on
 * fields nothing ever registered and the submit handler was never called:
 * a Place order button that silently did nothing.
 */
export const orderFormSchema = z.object({
  address: addressSchema,
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

/**
 * Everything that changes the PRICE. Name, phone and street lines are
 * order-time details and deliberately absent: re-quoting because someone
 * fixed a typo in a house number would be noise, and the printer charges
 * on destination, not on doorbell.
 */
export interface PricedConfig {
  printDocumentId: string;
  quantity: number;
  paperPreset: string;
  sides: Sides;
  fulfillmentType: FulfillmentType;
  urgency: string;
  postalCode: string;
  stateOrProvince: string;
  country: string;
}

/**
 * A stale price beside a live "Place order" button is the expensive bug in
 * this flow, so staleness is ONE derived predicate rather than a scatter of
 * setQuote(null) calls. Add a field to PricedConfig and it is covered.
 */
export function fingerprintOf(config: PricedConfig): string {
  return JSON.stringify([
    config.printDocumentId,
    config.quantity,
    config.paperPreset,
    config.sides,
    config.fulfillmentType,
    config.urgency,
    config.postalCode.trim().toUpperCase(),
    config.stateOrProvince.trim().toUpperCase(),
    config.country.trim().toUpperCase(),
  ]);
}

/**
 * Sides is NOT a choice: the print file already has one page or two, and
 * the server 400s both ways round. Deriving it is the only way the church
 * cannot mis-order — or be billed a double-sided rate for blank backs.
 */
export function deriveSides(document: Pick<PrintDocument, 'isDoubleSided'>): Sides {
  return document.isDoubleSided ? 'DOUBLE' : 'SINGLE';
}

/** Snap to what the provider will actually accept, rather than let it 400. */
export function clampQuantity(
  quantity: number,
  capabilities: Pick<ProviderCapabilities, 'minQuantity' | 'quantityStep' | 'maxQuantity'>
): number {
  const { minQuantity, quantityStep, maxQuantity } = capabilities;
  const bounded = Math.min(Math.max(quantity, minQuantity), maxQuantity);
  if (quantityStep <= 1) return bounded;
  const stepped = Math.round((bounded - minQuantity) / quantityStep) * quantityStep + minQuantity;
  return Math.min(Math.max(stepped, minQuantity), maxQuantity);
}

/** Sensible run sizes, filtered to what this provider can actually print. */
export function quantityPresets(
  capabilities: Pick<ProviderCapabilities, 'minQuantity' | 'quantityStep' | 'maxQuantity'>
): number[] {
  const candidates = [50, 100, 250, 500, 1000, 2500];
  const valid = candidates
    .filter((n) => n >= capabilities.minQuantity && n <= capabilities.maxQuantity)
    .filter((n) =>
      capabilities.quantityStep <= 1
        ? true
        : (n - capabilities.minQuantity) % capabilities.quantityStep === 0
    );
  // Always offer the minimum: it is the cheapest way to try the whole flow.
  return valid.includes(capabilities.minQuantity)
    ? valid
    : [capabilities.minQuantity, ...valid];
}

export const URGENCY_DESCRIPTIONS: Record<Urgency, string> = {
  STANDARD: 'The usual turnaround, and the cheapest.',
  EXPRESS: 'Costs more to produce, arrives sooner.',
  SAME_DAY: 'Printed today where the printer can manage it. The most expensive option.',
};

export const FULFILLMENT_LABELS: Record<FulfillmentType, string> = {
  DELIVERY: 'Delivered to the church',
  PICKUP: 'Collected locally',
};

/**
 * Which urgencies this provider offers at all. A provider that cannot do
 * same-day must not be offered for same-day and then fail at the counter.
 */
export function supportedUrgencies(capabilities: ProviderCapabilities): Urgency[] {
  const all: Urgency[] = ['STANDARD', 'EXPRESS', 'SAME_DAY'];
  return all.filter((urgency) => {
    if (urgency === 'SAME_DAY') return capabilities.supportsSameDay;
    if (urgency === 'EXPRESS') return capabilities.supportsExpress;
    return true;
  });
}

/**
 * The live provider, not the first row.
 *
 * `/print/providers/capabilities` lists every adapter, connected or not —
 * three of the four throw 503 on any call. Building the form against
 * `capabilities[0]` means quantity minimums and pickup support from a
 * provider nobody is using. The advisor is the only endpoint that names the
 * active one.
 */
export function activeCapabilities(
  all: ProviderCapabilities[] | undefined,
  activeProviderName: string | undefined
): ProviderCapabilities | null {
  if (!all?.length) return null;
  if (!activeProviderName) return null;
  return all.find((capability) => capability.name === activeProviderName) ?? null;
}

/** "This price holds until 4:30 PM" — a time, not a duration, so it stays true. */
export function formatQuoteExpiry(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const when = new Date(expiresAt);
  if (Number.isNaN(when.getTime())) return null;
  const sameDay = when.toDateString() === new Date().toDateString();
  return when.toLocaleString(undefined, {
    ...(sameDay ? {} : { weekday: 'short', month: 'short', day: 'numeric' }),
    hour: 'numeric',
    minute: '2-digit',
  });
}
