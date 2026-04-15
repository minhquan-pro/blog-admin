import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  deleteAdminNotification,
  fetchAdminNotifications,
  patchAdminNotification,
} from "@/lib/api";
import type { AdminNotificationRow } from "@/types/domain";
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

/** Khớp `NotificationType` trên blog (Blog-ui) — nhãn hiển thị cho admin */
const notificationTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    new_follow: "Theo dõi mới",
    new_comment: "Bình luận mới",
    new_clap: "Thích bài",
    new_like: "Thích bài",
    mention: "Nhắc tới",
  };
  return map[type] ?? type;
};

export function NotificationsPage() {
  const [userIn, setUserIn] = useState("");
  const [userId, setUserId] = useState("");
  const [rows, setRows] = useState<AdminNotificationRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    return fetchAdminNotifications({
      userId: userId.trim() || undefined,
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
  }, [userId]);

  async function markRead(id: string, read: boolean) {
    setBusy(id);
    try {
      await patchAdminNotification(id, read ? new Date().toISOString() : null);
      toast.success(read ? "Đã đọc" : "Đánh dấu chưa đọc");
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string) {
    setBusy(id);
    try {
      await deleteAdminNotification(id);
      toast.success("Đã xóa");
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Thông báo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cùng loại thông báo như trang «Thông báo» trên blog (theo dõi, bình luận, thích…).
          Tổng: {total}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lọc theo người nhận</CardTitle>
          <CardDescription>
            User ID của tài khoản nhận thông báo. Để trống để xem tất cả.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="space-y-2 max-w-md">
            <Label htmlFor="nuid">Người nhận (userId)</Label>
            <Input
              id="nuid"
              value={userIn}
              onChange={(e) => setUserIn(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setUserId(userIn.trim())}
          >
            Áp dụng
          </Button>
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
            <p className="text-sm text-muted-foreground">Không có thông báo.</p>
          )}
          {rows && rows.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loại</TableHead>
                  <TableHead>Người nhận</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell>
                      <Badge variant="outline" title={n.type}>
                        {notificationTypeLabel(n.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{n.userId}</TableCell>
                    <TableCell>
                      {n.readAt ? (
                        <span className="text-sm text-muted-foreground">Đã đọc</span>
                      ) : (
                        <Badge variant="secondary">Chưa đọc</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {n.readAt ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={busy === n.id}
                            onClick={() => void markRead(n.id, false)}
                          >
                            Chưa đọc
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={busy === n.id}
                            onClick={() => void markRead(n.id, true)}
                          >
                            Đã đọc
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={busy === n.id}
                          onClick={() => void remove(n.id)}
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
