export enum NewsCategory {
  NEWS = 'NEWS',
  TOURNAMENTS = 'TOURNAMENTS',
  INTERVIEWS = 'INTERVIEWS',
  PLAYERS = 'PLAYERS',
  AMATEUR = 'AMATEUR',
  UNIVERSITY = 'UNIVERSITY',
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverUrl: string | null;
  category: NewsCategory;
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  isPublished: boolean;
  publishedAt: Date | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  gallery: NewsImage[];
}

export interface NewsImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption: string | null;
  order: number;
}
