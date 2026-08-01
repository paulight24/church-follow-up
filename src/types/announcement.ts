import type { MediaAssetSummary } from '@/types/encouragement';

export const ANNOUNCEMENT_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type AnnouncementStatus = (typeof ANNOUNCEMENT_STATUSES)[number];

export const ANNOUNCEMENT_AUDIENCES = ['ALL', 'STAFF_ONLY'] as const;
export type AnnouncementAudience = (typeof ANNOUNCEMENT_AUDIENCES)[number];

export interface AnnouncementUserRef {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  imageAssetId?: string | null;
  imageAsset?: MediaAssetSummary | null;
  status: AnnouncementStatus;
  audience: AnnouncementAudience;
  isPinned: boolean;
  publishAt: string;
  expiresAt?: string | null;
  createdById?: string | null;
  createdBy?: AnnouncementUserRef | null;
  updatedById?: string | null;
  updatedBy?: AnnouncementUserRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  body: string;
  imageAssetId?: string;
  audience?: AnnouncementAudience;
  isPinned?: boolean;
  publishAt?: string;
  expiresAt?: string | null;
}

export interface UpdateAnnouncementRequest {
  title?: string;
  body?: string;
  imageAssetId?: string | null;
  status?: AnnouncementStatus;
  audience?: AnnouncementAudience;
  isPinned?: boolean;
  publishAt?: string;
  expiresAt?: string | null;
}

export interface AnnouncementListFilters {
  status?: AnnouncementStatus | '';
  audience?: AnnouncementAudience | '';
  isPinned?: boolean;
  page?: number;
  pageSize?: number;
}
