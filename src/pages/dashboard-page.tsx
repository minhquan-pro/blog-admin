import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { fetchAdminPosts } from "@/lib/api";
import type { AdminPostRow } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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

export function DashboardPage() {
  const [rows, setRows] = useState<AdminPostRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    void fetchAdminPosts()
      .then((data) => {
        if (!c) setRows(data);
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
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Bài viết</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Xem và chỉnh sửa mọi bài trong hệ thống (quyền quản trị).
        </p>
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
                      <Link
                        to={`/posts/${post.id}/edit`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "inline-flex",
                        )}
                      >
                        Sửa
                      </Link>
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
