export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED';

export type CampaignChannel = 'SMS' | 'WHATSAPP' | 'EMAIL';

export interface Campaign {
  id: string;
  name: string;
  subject?: string | null;
  content: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  scheduledAt?: string | null;
  sentAt?: string | null;
  recipientCount: number;
  deliveredCount: number;
  openedCount: number;
  failedCount: number;
  createdById: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CampaignRecipient {
  id: string;
  campaignId: string;
  memberId: string;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    email?: string | null;
  };
  status: 'PENDING' | 'DELIVERED' | 'OPENED' | 'FAILED' | 'BOUNCED';
  deliveredAt?: string | null;
  openedAt?: string | null;
  failedReason?: string | null;
}
