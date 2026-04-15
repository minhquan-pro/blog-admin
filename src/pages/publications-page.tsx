import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import {
  createAdminPublication,
  deleteAdminPublication,
  fetchAdminPublications,
} from "@/lib/api";
import type { Publication } from "@/types/domain";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export function PublicationsPage() {
  const [rows, setRows] = useState<Publication[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    return fetchAdminPublications()
      .then(setRows)
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
      await createAdminPublication({
        name,
        slug: slug || undefined,
        description: description || undefined,
      });
      toast.success("Đã tạo publication");
      setName("");
      setSlug("");
      setDescription("");
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa publication và thành viên? Bài gắn publication sẽ bị gỡ liên kết.")) {
      return;
    }
    setBusyId(id);
    try {
      await deleteAdminPublication(id);
      toast.success("Đã xóa");
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
        <h1 className="font-display text-2xl font-semibold">Publication</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tạo và quản lý tạp chí / nhóm xuất bản.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tạo mới</CardTitle>
          <CardDescription>Slug để trống sẽ tự sinh từ tên.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pub-name">Tên</Label>
                <Input
                  id="pub-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pub-slug">Slug</Label>
                <Input id="pub-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pub-desc">Mô tả</Label>
              <Textarea
                id="pub-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <Button type="submit">Tạo</Button>
          </form>
        </CardContent>
      </Card>

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
          {!rows && !error && (
            <p className="text-sm text-muted-foreground">Đang tải…</p>
          )}
          {rows && rows.length === 0 && (
            <p className="text-sm text-muted-foreground">Chưa có publication.</p>
          )}
          {rows && rows.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="font-mono text-sm">{p.slug}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/publications/${p.id}`}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "inline-flex",
                          )}
                        >
                          Thành viên
                        </Link>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={busyId === p.id}
                          onClick={() => void handleDelete(p.id)}
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
