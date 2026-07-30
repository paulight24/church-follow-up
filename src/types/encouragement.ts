export type EncouragementStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'SENDING'
  | 'SENT'
  | 'CANCELLED';

export type EncouragementMessageType =
  | 'SHORT'
  | 'SCRIPTURE'
  | 'IMAGE'
  | 'PERSONAL'
  | 'RECURRING_SERIES';

export type DeliveryChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';

/** Channels that are actually deliverable this phase (see encouragements.service.ts#DELIVERABLE_CHANNELS). */
export const DELIVERABLE_CHANNELS: DeliveryChannel[] = ['IN_APP', 'EMAIL', 'SMS'];

export type EncouragementRecipientStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';

export type EncouragementResponseType = 'AMEN' | 'PRAYER_REQUEST' | 'CALL_REQUEST';

/** Filter keys accepted by the backend's audience resolver (encouragements.service.ts#resolveCandidateMembers). */
export interface AudienceDefinition {
  all?: boolean;
  membershipStatusIds?: string[];
  departmentIds?: string[];
  fellowshipGroupIds?: string[];
  teamIds?: string[];
  isFirstTimer?: boolean;
  memberIds?: string[];
  singleMemberId?: string;
}

export interface EncouragementUserSummary {
  id: string;
  firstName: string;
  lastName: string;
}

export interface MediaAssetSummary {
  id: string;
  filename: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
}

export interface Encouragement {
  id: string;
  title: string;
  shortMessage: string;
  longMessage?: string | null;
  scriptureReference?: string | null;
  scriptureText?: string | null;
  messageType: EncouragementMessageType;
  imageAssetId?: string | null;
  imageAsset?: MediaAssetSummary | null;
  senderDisplayName?: string | null;
  sendAsPastor: boolean;
  status: EncouragementStatus;
  /** Raw JSON string as stored by the backend - JSON.parse to get an AudienceDefinition. */
  audienceDefinitionJson?: string | null;
  /** Raw JSON string as stored by the backend - JSON.parse to get DeliveryChannel[]. */
  deliveryChannelsJson?: string | null;
  scheduledAt?: string | null;
  recurrenceRule?: string | null;
  timezone: string;
  createdByUserId?: string | null;
  createdBy?: EncouragementUserSummary | null;
  approvedByUserId?: string | null;
  approvedBy?: EncouragementUserSummary | null;
  approvedAt?: string | null;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { recipients: number; responses: number };
}

export interface EncouragementRecipient {
  id: string;
  encouragementMessageId: string;
  memberId: string;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
  };
  channel: DeliveryChannel;
  destination?: string | null;
  status: EncouragementRecipientStatus;
  sentAt?: string | null;
  deliveredAt?: string | null;
  failedAt?: string | null;
  failureReason?: string | null;
  createdAt: string;
}

export interface EncouragementResponse {
  id: string;
  encouragementMessageId: string;
  memberId: string;
  member?: { id: string; firstName: string; lastName: string };
  responseType: EncouragementResponseType;
  responseText?: string | null;
  createdAt: string;
}

export interface CreateEncouragementRequest {
  title: string;
  shortMessage: string;
  longMessage?: string;
  scriptureReference?: string;
  scriptureText?: string;
  messageType?: EncouragementMessageType;
  imageAssetId?: string;
  senderDisplayName?: string;
  sendAsPastor?: boolean;
  audienceDefinitionJson?: AudienceDefinition;
  deliveryChannelsJson?: DeliveryChannel[];
  scheduledAt?: string;
  recurrenceRule?: string;
  timezone?: string;
}

export type UpdateEncouragementRequest = Partial<CreateEncouragementRequest>;

export interface QuickSendRequest {
  title?: string;
  shortMessage: string;
  senderDisplayName?: string;
  audienceDefinitionJson?: AudienceDefinition;
  deliveryChannelsJson?: DeliveryChannel[];
}

export interface EncouragementSendResult {
  message: Encouragement;
  sent: number;
  skipped: number;
  skippedDetail: Array<{ memberId: string; channel: DeliveryChannel; reason: string }>;
  unsupportedChannels: DeliveryChannel[];
}

export interface EncouragementAnalytics {
  messageId: string;
  status: EncouragementStatus;
  totalRecipients: number;
  byStatus: Record<string, number>;
  byChannel: Record<string, number>;
  responses: Record<string, number>;
}

export interface EncouragementListFilters {
  status?: string;
  messageType?: string;
  createdByUserId?: string;
  page?: number;
  pageSize?: number;
}

export interface EncouragementTemplate {
  id: string;
  name: string;
  messageType: EncouragementMessageType;
  bodyTemplate: string;
  mergeVarsJson?: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MemberMessagePreference {
  id: string;
  memberId: string;
  faithEncouragementEnabled: boolean;
  preferredChannel: DeliveryChannel;
  preferredLanguage?: string | null;
  preferredDeliveryTime?: string | null;
  frequencyPreference: 'LOW' | 'NORMAL' | 'HIGH';
  emailConsent: boolean;
  smsConsent: boolean;
  pushConsent: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  maxPerDay: number;
  maxPerWeek: number;
}
