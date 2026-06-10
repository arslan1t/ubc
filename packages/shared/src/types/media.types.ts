export enum MediaType {
  VIDEO = 'VIDEO',
  PHOTO = 'PHOTO',
  INTERVIEW = 'INTERVIEW',
  PODCAST = 'PODCAST',
}

export interface Media {
  id: string;
  title: string;
  description: string | null;
  type: MediaType;
  youtubeUrl: string | null;
  youtubeThumbnail: string | null;
  photoUrl: string | null;
  photoThumbnailUrl: string | null;
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  isPublished: boolean;
  publishedAt: Date | null;
  viewCount: number;
  createdAt: Date;
}
