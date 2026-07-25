// Matches the backend `Team` / `TeamUser` / `MemberAssignment` models
// (see church-follow-up-api/prisma/schema.prisma) and teams.service.ts /
// member-assignments.service.ts response shapes.
//
// NOTE: a team's "members" (TeamUser) are staff/workers who lead or follow
// up for the team. A church Member being followed up on is linked via a
// separate MemberAssignment record (to a team + primary/backup worker),
// not TeamUser. These are two different lists in the UI.

export type TeamStatus = 'ACTIVE' | 'INACTIVE';
export type TeamRole = 'LEADER' | 'WORKER' | 'BACKUP';

export interface TeamUserRef {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface TeamUser {
  id: string;
  teamId: string;
  userId: string;
  teamRole: TeamRole;
  isPrimaryLeader: boolean;
  startsAt: string;
  endsAt?: string | null;
  createdAt: string;
  user: TeamUserRef;
}

export interface Team {
  id: string;
  name: string;
  description?: string | null;
  status: TeamStatus;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    teamUsers?: number;
    memberAssignments?: number;
    followUpTasks?: number;
  };
  /** Present only on GET /teams/:id */
  teamUsers?: TeamUser[];
}

export interface TeamListFilters {
  search?: string;
  status?: TeamStatus;
  page?: number;
  pageSize?: number;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  status?: TeamStatus;
}

export type UpdateTeamRequest = Partial<CreateTeamRequest>;

export interface AddTeamUserRequest {
  userId: string;
  teamRole?: TeamRole;
  isPrimaryLeader?: boolean;
  startsAt?: string;
  endsAt?: string;
}

export interface UpdateTeamUserRequest {
  teamRole?: TeamRole;
  isPrimaryLeader?: boolean;
  endsAt?: string;
}

// ─── Member Assignments (church member <-> team/worker) ───────────────────

export interface MemberAssignmentMemberRef {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
}

export interface MemberAssignment {
  id: string;
  memberId: string;
  member: MemberAssignmentMemberRef;
  teamId: string;
  team: { id: string; name: string };
  primaryWorkerUserId: string;
  primaryWorker: TeamUserRef;
  backupWorkerUserId?: string | null;
  backupWorker?: TeamUserRef | null;
  assignedByUserId: string;
  assignedBy: { id: string; firstName: string; lastName: string };
  startsAt: string;
  endsAt?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MemberAssignmentListFilters {
  memberId?: string;
  teamId?: string;
  primaryWorkerUserId?: string;
  backupWorkerUserId?: string;
  active?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateMemberAssignmentRequest {
  memberId: string;
  teamId: string;
  primaryWorkerUserId: string;
  backupWorkerUserId?: string;
  startsAt?: string;
}

export interface UpdateMemberAssignmentRequest {
  teamId?: string;
  primaryWorkerUserId?: string;
  backupWorkerUserId?: string | null;
  startsAt?: string;
  endsAt?: string;
  active?: boolean;
}
