export type User = {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
};

export type UserProfile = {
  userId: string;
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
};

export type PostStatus = "draft" | "published" | "unlisted" | "archived";

export type Post = {
  id: string;
  authorId: string;
  publicationId: string | null;
  title: string;
  slug: string;
  subtitle: string;
  body: string;
  excerpt: string;
  coverImageUrl: string;
  status: PostStatus;
  publishedAt: string | null;
  readingTimeMinutes: number;
  clapCount: number;
  responseCount: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tagIds: string[];
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type Publication = {
  id: string;
  name: string;
  slug: string;
  description: string;
  avatarUrl: string;
  createdAt: string;
};

export type AdminPostRow = {
  post: Post;
  authorUsername: string;
  authorDisplayName: string;
  authorEmail: string;
};
