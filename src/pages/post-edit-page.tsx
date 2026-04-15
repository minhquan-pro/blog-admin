import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import {
  fetchPostForEdit,
  fetchPublications,
  fetchTags,
  patchPost,
  type EditorPayload,
} from "@/lib/api";
import type { Post, Publication, Tag } from "@/types/domain";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function tagSlugsFromPost(post: Post, allTags: Tag[]): string[] {
  const byId = new Map(allTags.map((t) => [t.id, t.slug]));
  return post.tagIds.map((id) => byId.get(id)).filter((s): s is string => !!s);
}

const statusOptions: { value: Post["status"]; label: string }[] = [
  { value: "draft", label: "Nháp" },
  { value: "published", label: "Đã xuất bản" },
  { value: "unlisted", label: "Không niêm yết" },
  { value: "archived", label: "Lưu trữ" },
];

export function PostEditPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tagSlugsInput, setTagSlugsInput] = useState("");
  const [status, setStatus] = useState<Post["status"]>("draft");
  const [publicationId, setPublicationId] = useState<string>("");

  useEffect(() => {
    if (!postId) return;
    let c = false;
    Promise.all([fetchPostForEdit(postId), fetchTags(), fetchPublications()])
      .then(([p, t, pubs]) => {
        if (c) return;
        setPost(p);
        setPublications(pubs);
        setTitle(p.title);
        setSubtitle(p.subtitle);
        setBody(p.body);
        setExcerpt(p.excerpt);
        setCoverImageUrl(p.coverImageUrl);
        setStatus(p.status);
        setPublicationId(p.publicationId ?? "");
        const slugs = tagSlugsFromPost(p, t);
        setTagSlugsInput(slugs.join(", "));
      })
      .catch((e: unknown) => {
        if (!c) {
          const msg = e instanceof Error ? e.message : "Không tải được bài";
          setLoadError(msg);
          toast.error(msg);
        }
      });
    return () => {
      c = true;
    };
  }, [postId]);

  const parsedTagSlugs = useMemo(() => {
    return tagSlugsInput
      .split(/[,;\s]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }, [tagSlugsInput]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postId || !post) return;
    setSaving(true);
    try {
      const payload: EditorPayload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        body,
        excerpt: excerpt.trim(),
        coverImageUrl: coverImageUrl.trim(),
        tagSlugs: parsedTagSlugs,
        status,
        publicationId: publicationId || null,
      };
      await patchPost(postId, payload);
      toast.success("Đã lưu bài");
      navigate("/posts");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lưu thất bại";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!postId) {
    return <p className="text-muted-foreground">Thiếu mã bài.</p>;
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <p className="text-destructive" role="alert">
          {loadError}
        </p>
        <Link to="/posts" className={cn(buttonVariants({ variant: "outline" }))}>
          Về danh sách
        </Link>
      </div>
    );
  }

  if (!post) {
    return <p className="text-muted-foreground">Đang tải bài…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Sửa bài</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Đường dẫn công khai dùng slug đã tạo lúc đăng bài; ở đây bạn chỉnh nội dung và trạng thái
            xuất bản.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/posts" className={cn(buttonVariants({ variant: "outline" }))}>
            Hủy
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? "Đang lưu…" : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin chung</CardTitle>
          <CardDescription>
            Điền rõ ràng giúp người đọc và công cụ tìm kiếm hiểu bài viết.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle">Phụ đề (tuỳ chọn)</Label>
            <Input
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Tóm tắt</Label>
            <Textarea
              id="excerpt"
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover">Ảnh bìa (URL)</Label>
            <Input
              id="cover"
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <select
                id="status"
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                value={status}
                onChange={(e) => setStatus(e.target.value as Post["status"])}
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pub">Publication (tuỳ chọn)</Label>
              <select
                id="pub"
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                value={publicationId}
                onChange={(e) => setPublicationId(e.target.value)}
              >
                <option value="">— Bài cá nhân —</option>
                {publications.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Tác giả bài phải là thành viên publication. Nếu chọn sai, hệ thống sẽ báo lỗi khi
                lưu.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Thẻ (slug, cách nhau bởi dấu phẩy)</Label>
            <Input
              id="tags"
              value={tagSlugsInput}
              onChange={(e) => setTagSlugsInput(e.target.value)}
              placeholder="ví dụ: cong-nghe, doi-song"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nội dung</CardTitle>
          <CardDescription>Markdown hoặc văn bản thuần tùy quy ước site.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="body">Nội dung bài</Label>
            <Textarea
              id="body"
              rows={18}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[320px] font-mono text-sm"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t">
          <Link to="/posts" className={cn(buttonVariants({ variant: "outline" }))}>
            Hủy
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? "Đang lưu…" : "Lưu thay đổi"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
