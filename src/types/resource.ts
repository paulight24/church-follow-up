export const RESOURCE_ITEM_KINDS = ['FILE', 'LINK'] as const;
export type ResourceItemKind = (typeof RESOURCE_ITEM_KINDS)[number];

export type ResourcePageStatus = 'DRAFT' | 'PUBLISHED';

/** What the admin editor works with. */
export interface ResourceItemDraft {
  /** Absent on a row the church has just added and not yet saved. */
  id?: string;
  title: string;
  description?: string | null;
  kind: ResourceItemKind;
  mediaAssetId?: string | null;
  fileName?: string | null;
  fileSizeBytes?: number | null;
  externalUrl?: string | null;
  languageLabel?: string | null;
  active?: boolean;
  downloadCount?: number;
}

export interface ResourcePage {
  id: string;
  title: string;
  slug: string;
  intro?: string | null;
  contactNote?: string | null;
  heroImageAssetId?: string | null;
  heroImageUrl?: string | null;
  status: ResourcePageStatus;
  publicUrl: string;
  createdAt: string;
  updatedAt: string;
  items: Array<ResourceItemDraft & { id: string; sortOrder: number; downloadCount: number }>;
}

/** What a visitor's browser receives — no ids it cannot act on, no counts. */
export interface PublicResourcePage {
  title: string;
  slug: string;
  intro?: string | null;
  contactNote?: string | null;
  heroImageUrl?: string | null;
  churchName?: string | null;
  church?: {
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
  } | null;
  items: Array<{
    id: string;
    title: string;
    description?: string | null;
    kind: ResourceItemKind;
    languageLabel?: string | null;
    mimeType?: string | null;
    fileSizeBytes?: number | null;
    url: string;
  }>;
}

export const RESOURCE_INTERESTS = ['RECEIVE_CHRIST', 'LEARN_MORE', 'JOIN_CHURCH', 'CELL_GROUP'] as const;
export type ResourceInterest = (typeof RESOURCE_INTERESTS)[number];

export interface ResourceResponseSubmission {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  wantsContact?: boolean;
  interests?: ResourceInterest[];
  prayerRequest?: string;
  locale?: string;
}

export interface ResourceResponse {
  id: string;
  createdAt: string;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  wantsContact: boolean;
  interests: string[];
  prayerRequest?: string | null;
  locale?: string | null;
  memberId?: string | null;
  memberName?: string | null;
  handledAt?: string | null;
}

export interface ResourceResponseExportRow {
  receivedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  wantsContact: string;
  interests: string;
  prayerRequest: string;
  language: string;
  memberId: string;
}
