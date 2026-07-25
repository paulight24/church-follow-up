// ────────────────────────────────────────────────────────────────
// Follow-up cycles (base `/follow-up-cycles`)
// ────────────────────────────────────────────────────────────────

export type CycleStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export interface FollowUpCycle {
  id: string;
  name: string;
  weekStartDate: string;
  weekEndDate: string;
  status: CycleStatus;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number };
}

/** Only present on the GET /follow-up-cycles/:id detail response. */
export interface FollowUpCycleDetail extends FollowUpCycle {
  taskStatusCounts: Record<string, number>;
}

export interface CreateCycleRequest {
  name: string;
  weekStartDate: string;
  weekEndDate: string;
}

export interface UpdateCycleRequest {
  name?: string;
  weekStartDate?: string;
  weekEndDate?: string;
  status?: CycleStatus;
}

export interface CloseCycleRequest {
  rolloverToCycleId?: string;
}

export interface RolloverResult {
  rolledOverCount: number;
  taskIds: string[];
}

// ────────────────────────────────────────────────────────────────
// Follow-up tasks (base `/follow-up-tasks`)
// ────────────────────────────────────────────────────────────────

export type TaskStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'CONTACTED'
  | 'FOLLOW_UP_REQUIRED'
  | 'COMPLETED'
  | 'NO_ANSWER'
  | 'WRONG_CONTACT'
  | 'DO_NOT_CONTACT'
  | 'ESCALATED'
  | 'CANCELLED';

export type TaskPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

/** Computed by the backend, never stored - see follow-up-tasks.service.ts computeTaskColor(). */
export type TaskColor = 'GREEN' | 'YELLOW' | 'RED' | 'PURPLE' | 'GRAY';

export type ReasonCode =
  | 'NEW_VISITOR'
  | 'ABSENT'
  | 'PRAYER_REQUEST'
  | 'PASTORAL_REQUEST'
  | 'CAMPAIGN_RESPONSE'
  | 'IMPORT'
  | 'API'
  | 'MANUAL';

export type Channel = 'CALL' | 'SMS' | 'WHATSAPP' | 'EMAIL' | 'VISIT' | 'CARD';

export type Outcome =
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

export interface TaskUserRef {
  id: string;
  firstName: string;
  lastName: string;
}

/** The `member` shape nested on a task include - a small subset of the full Member record. */
export interface TaskMember {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
  phonePrimary?: string | null;
  doNotContact?: boolean;
}

export interface TaskCounts {
  interactions: number;
  reassignments: number;
  nonCompletionFeedback: number;
}

export interface FollowUpInteraction {
  id: string;
  taskId: string;
  memberId: string;
  performedByUserId: string;
  performedBy?: TaskUserRef;
  channel: Channel;
  outcome: Outcome;
  interactionAt: string;
  notes?: string | null;
  nextAction?: string | null;
  nextFollowUpAt?: string | null;
  requiresEscalation: boolean;
  createdAt: string;
}

export interface TaskReassignment {
  id: string;
  taskId: string;
  fromUserId?: string | null;
  toUserId: string;
  reassignedByUserId: string;
  reason?: string | null;
  createdAt: string;
}

export interface NonCompletionFeedback {
  id: string;
  followUpTaskId: string;
  reasonCode: string;
  details?: string | null;
  reportedByUserId: string;
  reportedBy?: TaskUserRef;
  reportedAt: string;
  createdAt: string;
}

export interface NonCompletionReason {
  id: string;
  code: string;
  label: string;
  description?: string | null;
  active: boolean;
}

export interface FollowUpTask {
  id: string;
  cycleId?: string | null;
  cycle?: { id: string; name: string; status: CycleStatus } | null;
  memberId: string;
  member: TaskMember;
  teamId?: string | null;
  team?: { id: string; name: string } | null;
  assignedUserId?: string | null;
  assignedUser?: TaskUserRef | null;
  reasonCode: ReasonCode;
  priority: TaskPriority;
  status: TaskStatus;
  color: TaskColor;
  callGuideId?: string | null;
  callGuide?: { id: string; name: string; status: string } | null;
  dueAt: string;
  firstAttemptAt?: string | null;
  completedAt?: string | null;
  reviewedByUserId?: string | null;
  reviewedAt?: string | null;
  rolledOverFromTaskId?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  _count?: TaskCounts;
  // detail-only fields (GET /follow-up-tasks/:id)
  reviewedBy?: TaskUserRef | null;
  createdBy?: TaskUserRef | null;
  rolledOverFromTask?: { id: string; status: TaskStatus; dueAt: string } | null;
  rolledOverToTask?: { id: string; status: TaskStatus; dueAt: string; cycleId: string } | null;
  interactions?: FollowUpInteraction[];
  reassignments?: TaskReassignment[];
  nonCompletionFeedback?: NonCompletionFeedback[];
  escalation?: unknown;
}

export interface CreateTaskRequest {
  cycleId?: string;
  memberId: string;
  teamId?: string;
  assignedUserId?: string;
  reasonCode: ReasonCode;
  priority?: TaskPriority;
  callGuideId?: string;
  dueAt: string;
}

export interface UpdateTaskRequest {
  cycleId?: string;
  teamId?: string;
  reasonCode?: ReasonCode;
  priority?: TaskPriority;
  status?: TaskStatus;
  callGuideId?: string;
  dueAt?: string;
  reviewedByUserId?: string;
}

export interface TaskListFilters {
  page?: number;
  pageSize?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  teamId?: string;
  assignedUserId?: string;
  memberId?: string;
  cycleId?: string;
  reasonCode?: ReasonCode;
  overdue?: boolean;
}

/**
 * Interaction form fields - must be completable in under a minute. Required:
 * channel, outcome, short note, next action. Conditional: nextFollowUpAt,
 * requiresEscalation.
 */
export interface CreateInteractionRequest {
  channel: Channel;
  outcome: Outcome;
  notes?: string;
  nextAction?: string;
  nextFollowUpAt?: string;
  requiresEscalation?: boolean;
}

export interface ReassignTaskRequest {
  toUserId: string;
  reason?: string;
}

export interface BulkReassignRequest {
  fromUserId: string;
  toUserId: string;
  reason?: string;
  teamId?: string;
}

export interface NonCompletionFeedbackRequest {
  reasonCode: string;
  details?: string;
}
