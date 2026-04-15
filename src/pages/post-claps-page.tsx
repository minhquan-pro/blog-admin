import { useEffect, useState } from "react";
import { toast } from "sonner";

import { deleteAdminPostClap, fetchAdminPostClaps } from "@/lib/api";
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

export function PostClapsPage() {
  const [userIn, setUserIn] = useState("");
  const [postIn, setPostIn] = useState("");
  const [userId, setUserId] = useState("");
  const [postId, setPostId] = useState("");
  const [rows, setRows] = useState<{ userId: string; postId: string; count: number }[] | null>(
    null,
  );
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    return fetchAdminPostClaps({
      userId: userId.trim() || undefined,
      postId: postId.trim() || undefined,
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
  }, [userId, postId]);

  async function remove(userId: string, postId: string) {
    const key = `${userId}:${postId}`;
    setBusy(key);
    try {
      await deleteAdminPostClap(userId, postId);
      toast.success("Đã xóa lượt thích");
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
        <h1 className="font-display text-2xl font-semibold">Thích</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lượt thích trên bài (nút «Thích» / tim trên blog). Tổng: {total}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lọc</CardTitle>
          <CardDescription>
            Tuỳ chọn userId (người thích) và/hoặc postId (bài được thích).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <Label htmlFor="cuid">Người thích (userId)</Label>
            <Input
              id="cuid"
              value={userIn}
              onChange={(e) => setUserIn(e.target.value)}
              className="font-mono text-sm w-72 max-w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpid">Bài viết (postId)</Label>
            <Input
              id="cpid"
              value={postIn}
              onChange={(e) => setPostIn(e.target.value)}
              className="font-mono text-sm w-72 max-w-full"
            />
          </div>
          <Button
            type="button"
            className="self-end"
            variant="secondary"
            onClick={() => {
              setUserId(userIn.trim());
              setPostId(postIn.trim());
            }}
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
            <p className="text-sm text-muted-foreground">Không có dữ liệu.</p>
          )}
          {rows && rows.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người thích</TableHead>
                  <TableHead>Bài viết</TableHead>
                  <TableHead>Số lượt thích</TableHead>
                  <TableHead className="text-right">Xóa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={`${r.userId}-${r.postId}`}>
                    <TableCell className="font-mono text-xs">{r.userId}</TableCell>
                    <TableCell className="font-mono text-xs">{r.postId}</TableCell>
                    <TableCell>{r.count}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={busy === `${r.userId}:${r.postId}`}
                        onClick={() => void remove(r.userId, r.postId)}
                      >
                        Xóa
                      </Button>
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
