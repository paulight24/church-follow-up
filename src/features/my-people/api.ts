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
