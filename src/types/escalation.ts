export type EscalationCategory =
  | 'BEREAVEMENT'
  | 'HOSPITALIZATION'
  | 'FAMILY_CRISIS'
  | 'SAFETY'
  | 'HOUSING'
  | 'EMPLOYMENT'
  | 'SPIRITUAL_COUNSELING'
  | 'REPEATED_NO_CONTACT'
  | 'OTHER';

export type EscalationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type EscalationStatus = 'OPEN' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type NoteVisibilityLevel = 'PASTOR_ONLY' | 'PASTORAL_TEAM' | 'LEADERSHIP';

export interface EscalationUserRef {
  id: string;
  firstName: string;
  lastName: string;
}

export interface EscalationMemberRef {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
}

export interface EscalationTaskRef {
  id: string;
  status: string;
  dueAt: string;
}

export interface Escalation {
  id: string;
  memberId: string;
  member: EscalationMemberRef;
  taskId?: string | null;
  task?: EscalationTaskRef | null;
  createdByUserId: string;
  createdBy: EscalationUserRef;
  assignedToUserId?: string | null;
  assignedTo?: EscalationUserRef | null;
  category: EscalationCategory;
  priority: EscalationPriority;
  status: EscalationStatus;
  summary: string;
  isConfidential: boolean;
  acknowledgedAt?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { notes: number };
}

export interface CreateEscalationRequest {
  memberId: string;
  taskId?: string;
  assignedToUserId?: string;
  category: EscalationCategory;
  priority?: EscalationPriority;
  summary: string;
  isConfidential?: boolean;
}

export interface UpdateEscalationRequest {
  assignedToUserId?: string;
  category?: EscalationCategory;
  priority?: EscalationPriority;
  status?: EscalationStatus;
  summary?: string;
  isConfidential?: boolean;
}

export interface EscalationListFilters {
  page?: number;
  pageSize?: number;
  status?: EscalationStatus;
  category?: EscalationCategory;
  priority?: EscalationPriority;
  assignedToUserId?: string;
  memberId?: string;
}

/**
 * Confidential pastoral note. Content is encrypted at rest; the API only
 * ever returns decrypted `content` from the dedicated notes endpoints, and
 * only to callers holding escalations.view_confidential_notes.
 */
export interface PastoralNote {
  id: string;
  escalationId: string;
  authorUserId: string;
  author?: EscalationUserRef;
  content: string;
  visibilityLevel: NoteVisibilityLevel;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  content: string;
  visibilityLevel?: NoteVisibilityLevel;
}
