export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' | 'ESCALATED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type Channel =
  | 'PHONE_CALL'
  | 'SMS'
  | 'WHATSAPP'
  | 'EMAIL'
  | 'IN_PERSON'
  | 'HOME_VISIT';

export type Outcome =
  | 'REACHED_POSITIVE'
  | 'REACHED_NEUTRAL'
  | 'REACHED_NEGATIVE'
  | 'NOT_REACHED'
  | 'VOICEMAIL'
  | 'WRONG_NUMBER'
  | 'REQUESTED_CALLBACK';

export interface FollowUpCycle {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  status: string;
  createdBy: string;
  taskCount: number;
  completedCount: number;
  createdAt: string;
}

export interface FollowUpTask {
  id: string;
  cycleId: string;
  memberId: string;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    email?: string | null;
  };
  assignedToId: string;
  assignedTo: {
    id: string;
    firstName: string;
    lastName: string;
  };
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  notes?: string | null;
  attemptCount: number;
  lastAttemptDate?: string | null;
  completedDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpInteraction {
  id: string;
  taskId: string;
  channel: Channel;
  outcome: Outcome;
  notes?: string | null;
  duration?: number | null;
  scheduledCallbackDate?: string | null;
  createdAt: string;
  createdBy: string;
}
