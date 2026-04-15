import type {
  AdminCommentRow,
  AdminDashboard,
  AdminNotificationRow,
  AdminPostRow,
  AdminPublicationMemberRow,
  AdminUserRow,
  Comment,
  Paginated,
  Post,
  PostStatus,
  Publication,
  PublicationMember,
  Tag,
  User,
  UserProfile,
} from "@/types/domain";
import { apiFetch } from "./client";

function adminQuery(params: Record<string, string | number | boolean | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "") continue;
    sp.set(k, String(v));
  }
  const q = sp.toString();
  return q ? `?${q}` : "";
}

export async function loginApi(
  email: string,
  password: string,
): Promise<{ user: User; profile: UserProfile | null }> {
  return apiFetch<{ user: User; profile: UserProfile | null }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logoutApi(): Promise<void> {
  await apiFetch<void>("/api/auth/logout", { method: "POST" });
}

export async function fetchAuthMe(): Promise<{
  user: User;
  profile: UserProfile | null;
} | null> {
  const base = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";
  const res = await fetch(`${base}/api/auth/me`, { credentials: "include" });
  if (res.status === 401) {
    return null;
  }
  if (res.status === 403) {
    await fetch(`${base}/api/auth/logout`, { method: "POST", credentials: "include" });
    return null;
  }
  if (!res.ok) {
    const text = await res.text();
    const data = text ? (JSON.parse(text) as { error?: string }) : {};
    throw new Error(
      typeof data.error === "string" ? data.error : res.statusText,
    );
  }
  return (await res.json()) as {
    user: User;
    profile: UserProfile | null;
  };
}

export interface FetchAdminPostsParams {
  status?: PostStatus;
  includeDeleted?: boolean;
  authorId?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchAdminPosts(
  params?: FetchAdminPostsParams,
): Promise<Paginated<AdminPostRow>> {
  return apiFetch<Paginated<AdminPostRow>>(
    `/api/admin/posts${adminQuery({
      status: params?.status,
      includeDeleted: params?.includeDeleted,
      authorId: params?.authorId,
      page: params?.page,
      pageSize: params?.pageSize,
    })}`,
  );
}

export async function fetchAdminDashboard(params?: {
  days?: 7 | 30 | 90;
}): Promise<AdminDashboard> {
  return apiFetch<AdminDashboard>(
    `/api/admin/dashboard${adminQuery({
      days: params?.days,
    })}`,
  );
}

export async function softDeleteAdminPost(postId: string): Promise<Post> {
  return apiFetch<Post>(`/api/admin/posts/${postId}/delete`, { method: "POST" });
}

export async function restoreAdminPost(postId: string): Promise<Post> {
  return apiFetch<Post>(`/api/admin/posts/${postId}/restore`, { method: "POST" });
}

export async function removePostTagAdmin(postId: string, tagId: string): Promise<void> {
  await apiFetch<void>(`/api/admin/posts/${postId}/tags/${tagId}`, { method: "DELETE" });
}

export async function fetchPostForEdit(postId: string): Promise<Post> {
  return apiFetch<Post>(`/api/posts/${postId}/edit`);
}

export async function fetchTags(): Promise<Tag[]> {
  return apiFetch<Tag[]>("/api/tags");
}

export async function fetchPublications(): Promise<Publication[]> {
  return apiFetch<Publication[]>("/api/publications");
}

export type EditorPayload = {
  title: string;
  subtitle: string;
  body: string;
  excerpt: string;
  coverImageUrl: string;
  tagSlugs: string[];
  status: Post["status"];
  publicationId: string | null;
};

export async function patchPost(postId: string, body: EditorPayload): Promise<Post> {
  return apiFetch<Post>(`/api/posts/${postId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/** --- Admin: users --- */

export async function fetchAdminUsers(params?: {
  query?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<AdminUserRow>> {
  return apiFetch<Paginated<AdminUserRow>>(
    `/api/admin/users${adminQuery({
      query: params?.query,
      page: params?.page,
      pageSize: params?.pageSize,
    })}`,
  );
}

export async function fetchAdminUser(userId: string): Promise<AdminUserRow> {
  return apiFetch<AdminUserRow>(`/api/admin/users/${userId}`);
}

export async function patchAdminUser(
  userId: string,
  body: { isAdmin?: boolean; isLocked?: boolean },
): Promise<AdminUserRow> {
  return apiFetch<AdminUserRow>(`/api/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function patchAdminUserProfile(
  userId: string,
  body: Partial<Pick<UserProfile, "displayName" | "username" | "bio" | "avatarUrl">>,
): Promise<AdminUserRow> {
  return apiFetch<AdminUserRow>(`/api/admin/users/${userId}/profile`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/** --- Admin: tags --- */

export async function fetchAdminTags(): Promise<Tag[]> {
  return apiFetch<Tag[]>("/api/admin/tags");
}

export async function createAdminTag(body: { name: string; slug?: string }): Promise<Tag> {
  return apiFetch<Tag>("/api/admin/tags", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAdminTag(
  tagId: string,
  body: { name?: string; slug?: string },
): Promise<Tag> {
  return apiFetch<Tag>(`/api/admin/tags/${tagId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteAdminTag(tagId: string): Promise<void> {
  await apiFetch<void>(`/api/admin/tags/${tagId}`, { method: "DELETE" });
}

/** --- Admin: publications --- */

export async function fetchAdminPublications(): Promise<Publication[]> {
  return apiFetch<Publication[]>("/api/admin/publications");
}

export async function fetchAdminPublication(id: string): Promise<Publication> {
  return apiFetch<Publication>(`/api/admin/publications/${id}`);
}

export async function createAdminPublication(body: {
  name: string;
  slug?: string;
  description?: string;
  avatarUrl?: string;
}): Promise<Publication> {
  return apiFetch<Publication>("/api/admin/publications", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAdminPublication(
  id: string,
  body: Partial<{ name: string; slug: string; description: string; avatarUrl: string }>,
): Promise<Publication> {
  return apiFetch<Publication>(`/api/admin/publications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteAdminPublication(id: string): Promise<void> {
  await apiFetch<void>(`/api/admin/publications/${id}`, { method: "DELETE" });
}

export async function fetchAdminPublicationMembers(
  publicationId: string,
): Promise<AdminPublicationMemberRow[]> {
  return apiFetch<AdminPublicationMemberRow[]>(
    `/api/admin/publications/${publicationId}/members`,
  );
}

export async function addAdminPublicationMember(
  publicationId: string,
  body: { userId: string; role: PublicationMember["role"] },
): Promise<PublicationMember> {
  return apiFetch<PublicationMember>(`/api/admin/publications/${publicationId}/members`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function patchAdminPublicationMember(
  publicationId: string,
  userId: string,
  role: PublicationMember["role"],
): Promise<PublicationMember> {
  return apiFetch<PublicationMember>(
    `/api/admin/publications/${publicationId}/members/${userId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ role }),
    },
  );
}

export async function removeAdminPublicationMember(
  publicationId: string,
  userId: string,
): Promise<void> {
  await apiFetch<void>(`/api/admin/publications/${publicationId}/members/${userId}`, {
    method: "DELETE",
  });
}

/** --- Admin: comments --- */

export async function fetchAdminComments(params?: {
  postId?: string;
  includeDeleted?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<AdminCommentRow>> {
  return apiFetch<Paginated<AdminCommentRow>>(
    `/api/admin/comments${adminQuery({
      postId: params?.postId,
      includeDeleted: params?.includeDeleted,
      page: params?.page,
      pageSize: params?.pageSize,
    })}`,
  );
}

export async function moderateAdminComment(
  commentId: string,
  deleted: boolean,
): Promise<Comment> {
  return apiFetch<Comment>(`/api/admin/comments/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify({ deleted }),
  });
}

/** --- Admin: engagement --- */

export async function fetchAdminPostClaps(params?: {
  userId?: string;
  postId?: string;
  page?: number;
  pageSize?: number;
}): Promise<
  Paginated<{ userId: string; postId: string; count: number }>
> {
  return apiFetch(`/api/admin/post-claps${adminQuery(params ?? {})}`);
}

export async function deleteAdminPostClap(userId: string, postId: string): Promise<void> {
  await apiFetch<void>(
    `/api/admin/post-claps${adminQuery({ userId, postId })}`,
    { method: "DELETE" },
  );
}

export async function fetchAdminBookmarks(params?: {
  userId?: string;
  postId?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<{ userId: string; postId: string; createdAt: string }>> {
  return apiFetch(`/api/admin/bookmarks${adminQuery(params ?? {})}`);
}

export async function deleteAdminBookmark(userId: string, postId: string): Promise<void> {
  await apiFetch<void>(
    `/api/admin/bookmarks${adminQuery({ userId, postId })}`,
    { method: "DELETE" },
  );
}

export async function fetchAdminUserFollows(params?: {
  followerId?: string;
  followingId?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<{ followerId: string; followingId: string }>> {
  return apiFetch(`/api/admin/user-follows${adminQuery(params ?? {})}`);
}

export async function deleteAdminUserFollow(
  followerId: string,
  followingId: string,
): Promise<void> {
  await apiFetch<void>(
    `/api/admin/user-follows${adminQuery({ followerId, followingId })}`,
    { method: "DELETE" },
  );
}

export async function fetchAdminNotifications(params?: {
  userId?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<AdminNotificationRow>> {
  return apiFetch<Paginated<AdminNotificationRow>>(
    `/api/admin/notifications${adminQuery(params ?? {})}`,
  );
}

export async function patchAdminNotification(
  id: string,
  readAt: string | null,
): Promise<AdminNotificationRow> {
  return apiFetch<AdminNotificationRow>(`/api/admin/notifications/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ readAt }),
  });
}

export async function deleteAdminNotification(id: string): Promise<void> {
  await apiFetch<void>(`/api/admin/notifications/${id}`, { method: "DELETE" });
}
