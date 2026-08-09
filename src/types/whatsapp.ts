// Shapes returned by the WhatsApp Cloud API integration endpoints
// (GET /whatsapp/status, GET /whatsapp/templates, POST /whatsapp/templates/sync).
// The backend talks to Meta directly - these types mirror the fields Meta's
// Phone Number / Message Templates APIs expose, normalized to camelCase.

/**
 * GET /whatsapp/status. `configured` is the only field guaranteed to be
 * present - everything else is only populated once WHATSAPP_PHONE_NUMBER_ID /
 * WHATSAPP_ACCESS_TOKEN / WHATSAPP_BUSINESS_ACCOUNT_ID are set on the server
 * and the backend could actually reach Meta with them.
 */
export interface WhatsAppStatus {
  configured: boolean;
  /** The Cloud API phone number in international format, e.g. "+1 555 010 1234". */
  displayPhoneNumber?: string | null;
  /** The Meta Business "verified name" shown to recipients as the sender. */
  verifiedName?: string | null;
  /** Meta's message quality signal for this number: GREEN / YELLOW / RED / UNKNOWN. */
  qualityRating?: string | null;
  /** Meta's phone number verification status, e.g. VERIFIED / NOT_VERIFIED / PENDING. */
  verificationStatus?: string | null;
  phoneNumberId?: string | null;
  businessAccountId?: string | null;
  /** Whether WHATSAPP_VERIFY_TOKEN/WHATSAPP_APP_SECRET are set so inbound webhooks (needed for the 24h window + delivery receipts) work. */
  webhookConfigured?: boolean;
}

export type WhatsAppTemplateStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | string;

/**
 * An approved-or-not Meta message template, as synced from
 * POST /whatsapp/templates/sync and listed by GET /whatsapp/templates.
 * `parameterCount` is how many `{{1}}`, `{{2}}`, ... placeholders `body`
 * contains - the compose UI must render exactly that many inputs.
 */
export interface WhatsAppTemplate {
  id: string;
  name: string;
  language: string;
  category: string;
  status: WhatsAppTemplateStatus;
  body: string;
  parameterCount: number;
}

export interface WhatsAppTemplateSyncResult {
  /** Number of templates fetched from Meta and stored/updated locally. */
  synced: number;
  message?: string;
}
