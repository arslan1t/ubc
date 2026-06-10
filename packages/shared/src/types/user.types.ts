export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
  TELEGRAM = 'TELEGRAM',
}

export interface UserProfile {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  telegramUsername: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}
