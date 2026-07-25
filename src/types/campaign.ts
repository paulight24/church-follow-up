export type CampaignStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'SENDING'
  | 'SENT'
  | 'CANCELLED'
  | 'FAILED';

export type CampaignRecipientStatus =
  | 'PENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'OPENED'
  | 'CLICKED'
  | 'BOUNCED'
  | 'UNSUBSCRIBED'
  | 'FAILED';

/** Filter keys accepted by the backend's segment resolver (campaigns.service.ts#resolveSegmentMembers). */
export interface SegmentDefinition {
  membershipStatusIds?: string[];
  departmentIds?: string[];
  fellowshipGroupIds?: string[];
  teamIds?: string[];
  isFirstTimer?: boolean;
  /** Manual selection overrides the criteria filters above. */
  memberIds?: string[];
}

export interface CampaignUserSummary {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string | null;
  status: CampaignStatus;
  /** Raw JSON string as stored by the backend - JSON.parse to get a SegmentDefinition. */
  segmentDefinitionJson?: string | null;
  teamId?: string | null;
  team?: { id: string; name: string } | null;
  scheduledAt?: string | null;
  sentAt?: string | null;
  createdById?: string | null;
  createdBy?: CampaignUserSummary | null;
  approvedById?: string | null;
  approvedBy?: CampaignUserSummary | null;
  createdAt: string;
  updatedAt: string;
  _count?: { recipients: number };
  /** Only present on GET /campaigns/:id (capped at 200 rows server-side). */
  recipients?: CampaignRecipient[];
}

export interface CampaignRecipient {
  id: string;
  campaignId: string;
  memberId: string;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
  };
  email?: string | null;
  status: CampaignRecipientStatus;
  providerMessageId?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  openedAt?: string | null;
  clickedAt?: string | null;
  bouncedAt?: string | null;
  unsubscribedAt?: string | null;
  createdAt: string;
}

export interface CreateCampaignRequest {
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  teamId?: string;
  segmentDefinitionJson?: SegmentDefinition;
  scheduledAt?: string;
}

export type UpdateCampaignRequest = Partial<CreateCampaignRequest>;

export interface CampaignListFilters {
  status?: string;
  teamId?: string;
  page?: number;
  pageSize?: number;
}

export interface SegmentPreview {
  estimatedRecipients: number;
}

export interface CampaignAnalytics {
  campaignId: string;
  status: CampaignStatus;
  totalRecipients: number;
  PENDING: number;
  SENT: number;
  DELIVERED: number;
  OPENED: number;
  CLICKED: number;
  BOUNCED: number;
  UNSUBSCRIBED: number;
  FAILED: number;
}
