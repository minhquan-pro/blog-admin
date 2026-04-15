export type User = {
  id: string;
  email: string;
  isAdmin: boolean;
  isLocked: boolean;
  createdAt: string;
};

export interface AdminUserRow {
  user: User;
  profile: UserProfile | null;
}

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

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminDashboardTimePoint {
  date: string;
  publishedPosts: number;
  newUsers: number;
  comments: number;
}

export interface AdminDashboardTopPost {
  id: string;
  title: string;
  slug: string;
  clapCount: number;
  responseCount: number;
}

export interface AdminDashboardTopTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface AdminDashboard {
  days: number;
  totals: {
    users: number;
    posts: number;
    postsPublished: number;
    comments: number;
    bookmarks: number;
    claps: number;
    tags: number;
    publications: number;
    userFollows: number;
    notifications: number;
  };
  postsByStatus: Record<PostStatus, number>;
  timeSeries: AdminDashboardTimePoint[];
  topPosts: AdminDashboardTopPost[];
  topTags: AdminDashboardTopTag[];
}

export type PublicationRole = "owner" | "editor" | "writer";

export interface PublicationMember {
  publicationId: string;
  userId: string;
  role: PublicationRole;
  createdAt: string;
}

export interface AdminPublicationMemberRow extends PublicationMember {
  profile: UserProfile | null;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  body: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCommentRow {
  comment: Comment;
  authorUsername: string;
  authorDisplayName: string;
}

export interface AdminNotificationRow {
  id: string;
  userId: string;
  type: string;
  payload: Record<string, string>;
  readAt: string | null;
  createdAt: string;
}
