export interface Team {
  id: string;
  name: string;
  description?: string | null;
  leaderId: string;
  leader: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  memberCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  role: 'LEADER' | 'MEMBER';
  assignedCount: number;
  completedCount: number;
  joinedAt: string;
}

export interface MemberAssignment {
  id: string;
  memberId: string;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    email?: string | null;
  };
  teamId: string;
  userId: string;
  assignedBy: string;
  assignedAt: string;
  status: string;
}
