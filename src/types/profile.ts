// Shape returned by GET /profile/me and accepted by PATCH /profile/me
// (self-service profile module — see backend `profile.service.ts`).
// This is intentionally a separate, narrow type from the richer admin
// `Member` shape in `@/types/member`: the self-service endpoints only ever
// return/accept the caller's own record, and the PATCH schema is `.strict()`
// server-side, so the request type here must only ever contain the
// whitelisted keys below.

import type { Member } from './member';

/** GET /profile/me response: the caller's account plus their linked member (if any). */
export interface MyProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  status?: string;
  avatarUrl?: string | null;
  roles?: Array<{ id: string; name: string; code: string }>;
  /** Null when the account has no linked member record yet (common for staff-only accounts). */
  member: Member | null;
}

/**
 * PATCH /profile/me body. The backend Zod schema is `.strict()` — sending
 * any key outside this whitelist is a validation error, so keep this type
 * (and anything built from it) limited to exactly these fields.
 */
export interface UpdateMyProfileRequest {
  preferredName?: string;
  phonePrimary?: string;
  phoneSecondary?: string;
  email?: string;
  dateOfBirth?: string;
  weddingAnniversary?: string;
  profileImageUrl?: string;
  /**
   * Self-service WhatsApp opt-in/opt-out. Meta requires explicit consent
   * before the system can message someone on WhatsApp, and this is the
   * member's own preference to control - see ProfilePage.
   */
  communicationConsentWhatsapp?: boolean;
}
