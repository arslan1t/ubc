export type OpenRunStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'CANCELLED' | 'COMPLETED';

export type ParticipantStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'WAITLISTED';

export type SkillLevel = 'ANY' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface OpenRun {
  id: string;
  title: string | null;
  description: string | null;
  courtId: string;
  court: {
    id: string;
    name: string;
    address: string;
    city: string;
  };
  organizerId: string;
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  date: Date;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  currentParticipants: number;
  waitlistCount: number;
  spotsLeft: number;
  fee: number;
  isPublic: boolean;
  status: OpenRunStatus;
  skillLevel: SkillLevel;
  createdAt: Date;
}

export interface OpenRunParticipant {
  id: string;
  openRunId: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  status: ParticipantStatus;
  createdAt: Date;
}

export interface CreateOpenRunDto {
  courtId: string;
  title?: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  fee?: number;
  isPublic: boolean;
  skillLevel?: SkillLevel;
}
