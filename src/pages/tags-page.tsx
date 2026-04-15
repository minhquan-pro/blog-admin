import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  createAdminTag,
  deleteAdminTag,
  fetchAdminTags,
  updateAdminTag,
} from "@/lib/api";
import type { Tag } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TagsPage() {
  const [tags, setTags] = useState<Tag[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  function load() {
    return fetchAdminTags()
      .then(setTags)
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : "Không tải được";
        setError(msg);
        toast.error(msg);
      });
  }

  useEffect(() => {
    let c = false;
    void load().then(() => {
      if (!c) setError(null);
    });
    return () => {
      c = true;
    };
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createAdminTag({ name, slug: slug || undefined });
      toast.success("Đã tạo tag");
      setName("");
      setSlug("");
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa tag này?")) return;
    setBusyId(id);
    try {
      await deleteAdminTag(id);
      toast.success("Đã xóa");
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setBusyId(null);
    }
  }

  function startEdit(t: Tag) {
    setEditing(t);
    setEditName(t.name);
    setEditSlug(t.slug);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusyId(editing.id);
    try {
      await updateAdminTag(editing.id, { name: editName, slug: editSlug || undefined });
      toast.success("Đã lưu");
      setEditing(null);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Tag</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tag phải tồn tại trước khi gán vào bài viết.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tạo tag mới</CardTitle>
          <CardDescription>Slug để trống sẽ tự sinh từ tên.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Tên</Label>
              <Input
                id="tag-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag-slug">Slug (tuỳ chọn)</Label>
              <Input
                id="tag-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
            <Button type="submit">Tạo</Button>
          </form>
        </CardContent>
      </Card>

      {editing && (
        <Card>
          <CardHeader>
            <CardTitle>Sửa tag</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveEdit} className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Tên</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={busyId === editing.id}>
                Lưu
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Huỷ
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Danh sách</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {!tags && !error && (
            <p className="text-sm text-muted-foreground">Đang tải…</p>
          )}
          {tags && tags.length === 0 && (
            <p className="text-sm text-muted-foreground">Chưa có tag.</p>
          )}
          {tags && tags.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="font-mono text-sm">{t.slug}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(t)}
                        >
                          Sửa
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={busyId === t.id}
                          onClick={() => void handleDelete(t.id)}
                        >
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
