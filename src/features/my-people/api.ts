import api from '@/config/api';

export interface MyPerson {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  displayName: string;
  phonePrimary: string | null;
  email: string | null;
  isFirstTimer: boolean;
  visitorJourneyStage: string | null;
  assignmentRole: 'PRIMARY' | 'BACKUP';
  team: { id: string; name: string } | null;
  assignedAt: string;
  lastContactedAt: string | null;
}

export async function getMyPeople(): Promise<MyPerson[]> {
  const { data } = await api.get<MyPerson[]>('/members/my-people');
  return data;
}

export type ContactOutcome =
  | 'SUCCESSFUL'
  | 'NO_ANSWER'
  | 'WRONG_NUMBER'
  | 'DECLINED'
  | 'VOICEMAIL'
  | 'BUSY'
  | 'SCHEDULED_CALLBACK'
  | 'WILL_ATTEND'
  | 'WONT_ATTEND'
  | 'NEEDS_PRAYER'
  | 'NEEDS_PASTORAL_CARE'
  | 'DO_NOT_CONTACT'
  | 'OTHER';

export interface LogContactInput {
  channel: 'CALL' | 'SMS' | 'WHATSAPP' | 'EMAIL' | 'VISIT' | 'CARD';
  outcome: ContactOutcome;
  notes?: string;
}

export async function logContact(memberId: string, input: LogContactInput) {
  const { data } = await api.post(`/members/${memberId}/contacts`, input);
  return data;
}
