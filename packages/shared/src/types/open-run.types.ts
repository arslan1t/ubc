export enum OpenRunStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum ParticipantStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

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
  fee: number;
  isPublic: boolean;
  status: OpenRunStatus;
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
}
