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
