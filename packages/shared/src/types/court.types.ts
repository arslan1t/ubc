export enum CourtType {
  INDOOR = 'INDOOR',
  OUTDOOR = 'OUTDOOR',
}

export enum CourtSurface {
  HARDWOOD = 'HARDWOOD',
  ASPHALT = 'ASPHALT',
  CONCRETE = 'CONCRETE',
  RUBBER = 'RUBBER',
  OTHER = 'OTHER',
}

export interface CourtImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  isPrimary: boolean;
  order: number;
}

export interface Court {
  id: string;
  name: string;
  address: string;
  district: string | null;
  city: string;
  latitude: number;
  longitude: number;
  type: CourtType;
  surface: CourtSurface;
  isFree: boolean;
  hasLighting: boolean;
  hasChangingRooms: boolean;
  hoops: number;
  description: string | null;
  rating: number;
  reviewCount: number;
  images: CourtImage[];
  createdAt: Date;
}

export interface CourtFilters {
  type?: CourtType;
  isFree?: boolean;
  hasLighting?: boolean;
  city?: string;
  search?: string;
}
