/**
 * Creative & Print — wire types.
 *
 * Mirrors the backend's presenters exactly. Two conventions worth knowing
 * before reading further:
 *
 * - **Money is integer cents plus an ISO-4217 code.** Never format it with
 *   arithmetic on a float; use `formatMoney` in the feature's `lib/`.
 * - **A `null` money component means the provider said nothing about it**,
 *   which is not the same as zero. A quote with `shippingCents: null` has
 *   not told us shipping is free — render it as absent, not as $0.00.
 */

export const PRINT_SIZES = [
  'FULL_PAGE',
  'HALF_PAGE',
  'THIRD_PAGE',
  'QUARTER_PAGE',
  // 8.25×5.25in pieces, two-up on a real A4 sheet — matches the physical
  // cutting template many churches already print against.
  'A4_2UP',
] as const;
export type PrintSize = (typeof PRINT_SIZES)[number];

export const PRINT_MODES = ['OFFICE', 'PRESS'] as const;
export type PrintMode = (typeof PRINT_MODES)[number];

export type FlyerStatus = 'DRAFT' | 'GENERATING' | 'READY' | 'APPROVED' | 'ARCHIVED';
export type GenerationStatus = 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'SUPERSEDED';

export type PaperPreset = 'ECONOMY' | 'STANDARD' | 'PREMIUM_GLOSS';
export type Sides = 'SINGLE' | 'DOUBLE';
export type Finish = 'NONE' | 'MATTE' | 'GLOSS';
export type FulfillmentType = 'PICKUP' | 'DELIVERY';
export type Urgency = 'SAME_DAY' | 'EXPRESS' | 'STANDARD';

export type PaymentStatus = 'NOT_REQUIRED' | 'AWAITING' | 'PAID' | 'REFUNDED' | 'FAILED';

export type FulfillmentStatus =
  | 'DRAFT'
  | 'QUOTED'
  | 'AWAITING_PAYMENT'
  | 'PAID'
  | 'SUBMITTING'
  | 'SUBMITTED'
  | 'ACCEPTED'
  | 'PRINTING'
  | 'READY_FOR_PICKUP'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED';

export interface BrandProfile {
  id: string;
  logoAssetId: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  preferredFonts: string[];
  socialAccounts: Record<string, string> | null;
  website: string | null;
  phone: string | null;
  addressLine: string | null;
  pastorName: string | null;
  styleNotes: string | null;
  preferredStyle: string | null;
  updatedAt: string;
}

export interface BrandProfileRequest {
  logoAssetId?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
  preferredFonts?: string[] | null;
  website?: string | null;
  phone?: string | null;
  addressLine?: string | null;
  pastorName?: string | null;
  styleNotes?: string | null;
  preferredStyle?: string | null;
}

/** The structured brief the artwork was generated from. */
export interface FlyerBrief {
  headline: string;
  subheadline?: string;
  eventName?: string;
  date?: string;
  time?: string;
  location?: string;
  callToAction?: string;
  audience?: string;
  visualDirection?: string;
  imageryInstructions: string[];
  /** Facts the flyer must carry. Re-asserted over every revision. */
  requiredText: string[];
  /** Constraints carried forward so a revision cannot quietly drop them. */
  forbiddenChanges: string[];
}

export interface FlyerVersion {
  id: string;
  versionNumber: number;
  parentVersionId: string | null;
  conceptLabel: string | null;
  revisionInstruction: string | null;
  provider: string;
  approvalStatus: ApprovalStatus;
  brief: FlyerBrief | null;
  createdAt: string;
}

export interface FlyerSummary {
  id: string;
  title: string;
  description: string | null;
  printSize: PrintSize;
  status: FlyerStatus;
  currentVersionId: string | null;
  qrDestination: string | null;
  event: { id: string; name: string; eventDate: string; slug: string } | null;
  createdBy: { id: string; firstName: string; lastName: string } | null;
  versionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FlyerDetail extends FlyerSummary {
  versions: FlyerVersion[];
}

export interface CreateFlyerRequest {
  title: string;
  description?: string;
  eventId?: string;
  printSize?: PrintSize;
  qrDestination?: string;
}

export interface Generation {
  id: string;
  flyerId: string;
  kind: 'BRIEF' | 'CONCEPTS' | 'REVISION';
  status: GenerationStatus;
  provider: string;
  errorMessage: string | null;
  attemptCount: number;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

export type ResolutionVerdict = 'PASS' | 'WARN' | 'BLOCK';

export interface PrintDocument {
  id: string;
  flyerId: string;
  flyerVersionId: string;
  /** Set when this is a double-sided document; the PDF has two pages. */
  backFlyerVersionId: string | null;
  isDoubleSided: boolean;
  pageCount: number;
  /** How to feed the duplex printer ("flip on the LONG edge…"). */
  duplexInstruction: string | null;
  layout: PrintSize;
  mode: PrintMode;
  perSheet: number;
  /**
   * What the paper will ACTUALLY measure. OFFICE mode scales the grid to
   * fit a printable margin, so this is not always the nominal size — show
   * this figure, never the label.
   */
  finishedInches: { width: number; height: number };
  sheetInches: { width: number; height: number };
  /** Worst of the two sides for duplex documents. */
  effectiveDpi: number;
  resolutionVerdict: ResolutionVerdict;
  backEffectiveDpi: number | null;
  backResolutionVerdict: ResolutionVerdict | null;
  sizeBytes: number;
  checksum: string | null;
  /** Ordering stays blocked until this is true. */
  qrVerified: boolean;
  qrVerifiedUrl: string | null;
  warnings: string[];
  createdAt: string;
}

export interface QuoteLineItem {
  label: string;
  amountCents: number;
}

export interface PrintQuote {
  id: string;
  printDocumentId: string;
  provider: string;
  /** True means sample pricing — the UI must say so visibly. */
  isMock: boolean;
  quantity: number;
  paperPreset: PaperPreset;
  sides: Sides;
  finish: Finish | null;
  fulfillmentType: FulfillmentType;
  urgency: Urgency;
  subtotalCents: number;
  productionFeeCents: number | null;
  shippingCents: number | null;
  estimatedTaxCents: number | null;
  serviceFeeCents: number;
  totalCents: number;
  currency: string;
  /** False means the tax is an estimate and must be labelled as one. */
  taxIsFinal: boolean;
  estimatedReadyAt: string | null;
  estimatedDeliveryAt: string | null;
  expiresAt: string | null;
  /** Guaranteed by the server to sum to totalCents. */
  lineItems: QuoteLineItem[];
  createdAt: string;
}

export interface PrintOrder {
  id: string;
  printDocumentId: string;
  printQuoteId: string | null;
  provider: string;
  providerOrderId: string | null;
  providerStatus: string | null;
  quantity: number;
  paperPreset: PaperPreset;
  sides: Sides;
  finish: Finish | null;
  fulfillmentType: FulfillmentType;
  urgency: Urgency;
  subtotalCents: number;
  productionFeeCents: number | null;
  shippingCents: number | null;
  taxCents: number | null;
  serviceFeeCents: number;
  totalCents: number;
  currency: string;
  /** Deliberately distinct from fulfilment — never conflate the two. */
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PrintOrderEvent {
  id: string;
  eventType: string;
  fromStatus: string | null;
  toStatus: string | null;
  source: string;
  detail: Record<string, unknown> | null;
  createdAt: string;
}

export interface PrintOrderDetail extends PrintOrder {
  events: PrintOrderEvent[];
}

export interface PaperOption {
  preset: PaperPreset;
  displayName: string;
  description: string;
  providerCode: string;
  recommended: boolean;
}

export interface ProviderCapabilities {
  name: string;
  displayName: string;
  supportsPickup: boolean;
  supportsDelivery: boolean;
  supportsSameDay: boolean;
  supportsExpress: boolean;
  supportsQuoting: boolean;
  supportsCancellation: boolean;
  sizes: PrintSize[];
  paperPresets: PaperPreset[];
  minQuantity: number;
  quantityStep: number;
  maxQuantity: number;
  currency: string;
  artwork: {
    bleedInches: number;
    minDpi: number;
    wantsCropMarks: boolean;
    acceptedFormats: string[];
  };
  isMock: boolean;
}

export interface PrintAdvice {
  daysUntilEvent: number | null;
  recommendedUrgency: Urgency;
  recommendedFulfillment: FulfillmentType | 'SELF_PRINT';
  unavailableUrgencies: Urgency[];
  /** One sentence, written for a volunteer. Render verbatim. */
  message: string;
  tooLate: boolean;
  provider: string;
  providerDisplayName: string;
  /** Set when nothing can arrive in time — where to print locally instead. */
  selfPrintUrl: string | null;
}
