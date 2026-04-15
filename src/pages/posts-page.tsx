import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { fetchAdminPosts, restoreAdminPost, softDeleteAdminPost } from "@/lib/api";
import type { AdminPostRow } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

const statusLabel: Record<string, string> = {
  draft: "Nháp",
  published: "Đã xuất bản",
  unlisted: "Không niêm yết",
  archived: "Lưu trữ",
};

export function PostsPage() {
  const [rows, setRows] = useState<AdminPostRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    void fetchAdminPosts({ includeDeleted, page: 1, pageSize: 50 })
      .then((data) => {
        if (!c) {
          setRows(data.items);
          setTotal(data.total);
        }
      })
      .catch((e: unknown) => {
        if (!c) {
          const msg = e instanceof Error ? e.message : "Không tải được danh sách";
          setError(msg);
          toast.error(msg);
        }
      });
    return () => {
      c = true;
    };
  }, [includeDeleted]);

  async function handleSoftDelete(postId: string) {
    setBusyId(postId);
    try {
      await softDeleteAdminPost(postId);
      toast.success("Đã xóa mềm bài viết");
      const data = await fetchAdminPosts({ includeDeleted, page: 1, pageSize: 50 });
      setRows(data.items);
      setTotal(data.total);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setBusyId(null);
    }
  }

  async function handleRestore(postId: string) {
    setBusyId(postId);
    try {
      await restoreAdminPost(postId);
      toast.success("Đã khôi phục bài viết");
      const data = await fetchAdminPosts({ includeDeleted, page: 1, pageSize: 50 });
      setRows(data.items);
      setTotal(data.total);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Xem và chỉnh sửa mọi bài trong hệ thống (quyền quản trị). Tổng: {total}.
        </p>
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => setIncludeDeleted(e.target.checked)}
            className="rounded border-border"
          />
          Hiển thị cả bài đã xóa mềm
        </label>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách</CardTitle>
          <CardDescription>
            Sắp xếp theo cập nhật gần nhất. Chọn &quot;Sửa&quot; để mở trình soạn.
          </CardDescription>
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
            <p className="text-sm text-muted-foreground">Chưa có bài nào.</p>
          )}
          {rows && rows.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Tác giả</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ post, authorDisplayName, authorUsername }) => (
                  <TableRow key={post.id}>
                    <TableCell className="max-w-[220px] font-medium">
                      <span className="line-clamp-2">{post.title}</span>
                      {post.deletedAt && (
                        <Badge variant="destructive" className="ml-2">
                          Đã xóa mềm
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span>{authorDisplayName || authorUsername}</span>
                        <span className="text-xs text-muted-foreground">
                          @{authorUsername}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {statusLabel[post.status] ?? post.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          to={`/posts/${post.id}/edit`}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "inline-flex",
                          )}
                        >
                          Sửa
                        </Link>
                        {!post.deletedAt ? (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={busyId === post.id}
                            onClick={() => void handleSoftDelete(post.id)}
                          >
                            Xóa mềm
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={busyId === post.id}
                            onClick={() => void handleRestore(post.id)}
                          >
                            Khôi phục
                          </Button>
                        )}
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
