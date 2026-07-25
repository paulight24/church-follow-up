export type EscalationType =
  | 'PASTORAL_NEED'
  | 'PRAYER_REQUEST'
  | 'CRISIS'
  | 'MEDICAL'
  | 'FINANCIAL'
  | 'FAMILY'
  | 'SPIRITUAL_DISTRESS';

export type EscalationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type EscalationStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Escalation {
  id: string;
  memberId: string;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    email?: string | null;
  };
  reportedById: string;
  reportedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  type: EscalationType;
  priority: EscalationPriority;
  status: EscalationStatus;
  title: string;
  description: string;
  confidentialNotes?: string | null;
  assignedToId?: string | null;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  resolvedAt?: string | null;
  resolvedById?: string | null;
  resolvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  resolutionNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEscalationRequest {
  memberId: string;
  type: EscalationType;
  priority: EscalationPriority;
  title: string;
  description: string;
  confidentialNotes?: string;
  assignedToId?: string;
}
