import type {
  AdminPostRow,
  Post,
  Publication,
  Tag,
  User,
  UserProfile,
} from "@/types/domain";
import { apiFetch } from "./client";

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

export async function fetchAdminPosts(): Promise<AdminPostRow[]> {
  return apiFetch<AdminPostRow[]>("/api/admin/posts");
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
