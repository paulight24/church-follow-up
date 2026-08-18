/**
 * Formatting helpers for Creative & Print.
 *
 * Money is integer cents on the wire and must stay that way until the last
 * moment. Every helper here takes cents; none of them takes a float.
 */
import type {
  FlyerStatus,
  FulfillmentStatus,
  PaperPreset,
  PrintSize,
  ResolutionVerdict,
  Urgency,
} from '@/types/creativePrint';

/** Cents → "$96.00". Divides once, at the boundary. */
export function formatMoney(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

/**
 * A money component that may be absent. `null` means the provider said
 * nothing about it — rendering that as "$0.00" would claim it is free.
 */
export function formatOptionalMoney(cents: number | null, currency = 'USD'): string | null {
  return cents === null ? null : formatMoney(cents, currency);
}

/** 5.5 → `5½"`, because printers and church staff both read it that way. */
export function formatInches(value: number): string {
  const whole = Math.floor(value);
  const fraction = value - whole;
  const eighths = Math.round(fraction * 8);
  if (eighths === 0) return `${whole}"`;
  if (eighths === 8) return `${whole + 1}"`;
  const glyphs: Record<number, string> = {
    1: '⅛',
    2: '¼',
    3: '⅜',
    4: '½',
    5: '⅝',
    6: '¾',
    7: '⅞',
  };
  return `${whole > 0 ? whole : ''}${glyphs[eighths]}"`;
}

export const PRINT_SIZE_LABELS: Record<PrintSize, string> = {
  FULL_PAGE: 'Full page',
  HALF_PAGE: 'Half page',
  THIRD_PAGE: 'Third page',
  QUARTER_PAGE: 'Quarter page',
};

export const PRINT_SIZE_DESCRIPTIONS: Record<PrintSize, string> = {
  FULL_PAGE: 'One flyer per sheet. Best for posters and noticeboards.',
  HALF_PAGE: 'Two per sheet. The usual choice for handouts.',
  THIRD_PAGE: 'Three per sheet. Slim strips, good for pew cards.',
  QUARTER_PAGE: 'Four per sheet. Cheapest for large giveaways.',
};

export const PAPER_LABELS: Record<PaperPreset, string> = {
  ECONOMY: 'Economy',
  STANDARD: 'Standard',
  PREMIUM_GLOSS: 'Premium gloss',
};

export const URGENCY_LABELS: Record<Urgency, string> = {
  SAME_DAY: 'Same day',
  EXPRESS: 'Express',
  STANDARD: 'Standard',
};

/** Written for a volunteer, not a printer. */
export const FLYER_STATUS_LABELS: Record<FlyerStatus, string> = {
  DRAFT: 'Draft',
  GENERATING: 'Creating…',
  READY: 'Ready to review',
  APPROVED: 'Approved',
  ARCHIVED: 'Archived',
};

export const ORDER_STATUS_LABELS: Record<FulfillmentStatus, string> = {
  DRAFT: 'Draft',
  QUOTED: 'Quoted',
  AWAITING_PAYMENT: 'Awaiting payment',
  PAID: 'Paid',
  SUBMITTING: 'Sending to printer',
  SUBMITTED: 'Sent to printer',
  ACCEPTED: 'Accepted by printer',
  PRINTING: 'Printing',
  READY_FOR_PICKUP: 'Ready for pickup',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
};

/**
 * What to tell a church about print quality, in their language. The
 * verdict names are ours; these sentences are theirs.
 */
export function resolutionMessage(verdict: ResolutionVerdict, dpi: number): string | null {
  if (verdict === 'PASS') return null;
  if (verdict === 'WARN') {
    return `This prints at about ${dpi} DPI. It will look acceptable, but not sharp — regenerate for the best result.`;
  }
  return `This prints at only about ${dpi} DPI, too low for print. Regenerate before ordering — enlarging it cannot add detail.`;
}

/** A stable key per print attempt, so a retry never becomes a second order. */
export function newIdempotencyKey(): string {
  return `mc-${crypto.randomUUID()}`;
}
