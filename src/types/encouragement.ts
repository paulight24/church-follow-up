import type { CampaignChannel } from './campaign';

export interface Encouragement {
  id: string;
  title: string;
  message: string;
  scriptureReference?: string | null;
  scriptureText?: string | null;
  channel: CampaignChannel;
  audience: string;
  sentById: string;
  sentBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  recipientCount: number;
  sentAt?: string | null;
  createdAt: string;
}

export interface CreateEncouragementRequest {
  title: string;
  message: string;
  scriptureReference?: string;
  scriptureText?: string;
  channel: CampaignChannel;
  audience: string;
  recipientIds?: string[];
}
