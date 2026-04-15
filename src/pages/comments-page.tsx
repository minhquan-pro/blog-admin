import { useEffect, useState } from "react";
import { toast } from "sonner";

import { fetchAdminComments, moderateAdminComment } from "@/lib/api";
import type { AdminCommentRow } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
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

export function CommentsPage() {
  const [postIdInput, setPostIdInput] = useState("");
  const [postId, setPostId] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [rows, setRows] = useState<AdminCommentRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    return fetchAdminComments({
      postId: postId || undefined,
      includeDeleted,
      page: 1,
      pageSize: 50,
    })
      .then((data) => {
        setRows(data.items);
        setTotal(data.total);
      })
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
  }, [postId, includeDeleted]);

  async function setDeleted(commentId: string, deleted: boolean) {
    setBusyId(commentId);
    try {
      await moderateAdminComment(commentId, deleted);
      toast.success(deleted ? "Đã ẩn bình luận" : "Đã khôi phục");
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Bình luận</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kiểm duyệt (xóa mềm). Tổng khớp bộ lọc: {total}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>Để trống post ID để xem toàn hệ thống.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <Label htmlFor="post-filter">Post ID</Label>
            <Input
              id="post-filter"
              value={postIdInput}
              onChange={(e) => setPostIdInput(e.target.value)}
              className="font-mono text-sm w-80 max-w-full"
              placeholder="uuid bài viết"
            />
          </div>
          <Button
            type="button"
            className="mt-8"
            variant="secondary"
            onClick={() => setPostId(postIdInput.trim())}
          >
            Áp dụng
          </Button>
          <label className="flex items-center gap-2 text-sm mt-8">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
            />
            Gồm đã ẩn
          </label>
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
            <p className="text-sm text-muted-foreground">Không có bình luận.</p>
          )}
          {rows && rows.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ comment, authorUsername }) => (
                  <TableRow key={comment.id}>
                    <TableCell className="max-w-md">
                      <p className="line-clamp-3 text-sm">{comment.body}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        @{authorUsername || comment.authorId.slice(0, 8)}
                      </p>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{comment.postId}</TableCell>
                    <TableCell>
                      {comment.deletedAt ? (
                        <Badge variant="destructive">Đã ẩn</Badge>
                      ) : (
                        <Badge variant="secondary">Hiển thị</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!comment.deletedAt ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={busyId === comment.id}
                          onClick={() => void setDeleted(comment.id, true)}
                        >
                          Ẩn
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={busyId === comment.id}
                          onClick={() => void setDeleted(comment.id, false)}
                        >
                          Khôi phục
                        </Button>
                      )}
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
