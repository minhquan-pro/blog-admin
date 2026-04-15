import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { fetchAdminUsers, patchAdminUser } from "@/lib/api";
import type { AdminUserRow } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function UsersPage() {
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<AdminUserRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await fetchAdminUsers({ query: query || undefined, page: 1, pageSize: 50 });
    setRows(data.items);
    setTotal(data.total);
  }, [query]);

  useEffect(() => {
    let c = false;
    void load()
      .catch((e: unknown) => {
        if (!c) {
          const msg = e instanceof Error ? e.message : "Không tải được";
          setError(msg);
          toast.error(msg);
        }
      })
      .then(() => {
        if (!c) setError(null);
      });
    return () => {
      c = true;
    };
  }, [load]);

  async function toggleAdmin(userId: string, next: boolean) {
    setBusyId(userId);
    try {
      await patchAdminUser(userId, { isAdmin: next });
      toast.success("Đã cập nhật quyền");
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleLocked(userId: string, nextLocked: boolean) {
    setBusyId(userId);
    try {
      await patchAdminUser(userId, { isLocked: nextLocked });
      toast.success(nextLocked ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản");
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
        <h1 className="font-display text-2xl font-semibold">Người dùng</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý quyền admin và khóa tài khoản. Khi khóa, bài viết công khai không hiển thị (dữ liệu
          không bị xóa). Tổng: {total}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm</CardTitle>
          <CardDescription>Email, username hoặc tên hiển thị.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Input
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Từ khóa…"
            className="max-w-sm"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setQuery(queryInput.trim());
            }}
          >
            Tìm
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
            <p className="text-sm text-muted-foreground">Không có kết quả.</p>
          )}
          {rows && rows.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Quản trị</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ user, profile }) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-sm">{user.email}</TableCell>
                    <TableCell>
                      {profile ? (
                        <span>
                          @{profile.username}
                          <span className="ml-2 text-muted-foreground">
                            {profile.displayName}
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <Badge>Admin</Badge>
                      ) : (
                        <Badge variant="secondary">User</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.isLocked ? (
                        <Badge variant="destructive">Đã khóa</Badge>
                      ) : (
                        <Badge variant="outline">Hoạt động</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={user.isAdmin ? "outline" : "default"}
                          disabled={busyId === user.id || user.isLocked}
                          onClick={() => void toggleAdmin(user.id, !user.isAdmin)}
                        >
                          {user.isAdmin ? "Gỡ admin" : "Cấp admin"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={user.isLocked ? "default" : "destructive"}
                          disabled={busyId === user.id}
                          onClick={() => void toggleLocked(user.id, !user.isLocked)}
                        >
                          {user.isLocked ? "Mở khóa" : "Khóa"}
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
