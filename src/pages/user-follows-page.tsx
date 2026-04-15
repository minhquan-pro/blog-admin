import { useEffect, useState } from "react";
import { toast } from "sonner";

import { deleteAdminUserFollow, fetchAdminUserFollows } from "@/lib/api";
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

export function UserFollowsPage() {
  const [followerIn, setFollowerIn] = useState("");
  const [followingIn, setFollowingIn] = useState("");
  const [followerId, setFollowerId] = useState("");
  const [followingId, setFollowingId] = useState("");
  const [rows, setRows] = useState<{ followerId: string; followingId: string }[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    return fetchAdminUserFollows({
      followerId: followerId.trim() || undefined,
      followingId: followingId.trim() || undefined,
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
  }, [followerId, followingId]);

  async function remove(followerId: string, followingId: string) {
    const key = `${followerId}:${followingId}`;
    setBusy(key);
    try {
      await deleteAdminUserFollow(followerId, followingId);
      toast.success("Đã bỏ theo dõi");
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
        <h1 className="font-display text-2xl font-semibold">Theo dõi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quan hệ theo dõi (nút «Theo dõi» trên hồ sơ / bài viết). Tổng: {total}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lọc</CardTitle>
          <CardDescription>
            followerId = người theo dõi, followingId = người được theo dõi (tác giả).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <Label htmlFor="fid">Người theo dõi (followerId)</Label>
            <Input
              id="fid"
              value={followerIn}
              onChange={(e) => setFollowerIn(e.target.value)}
              className="font-mono text-sm w-72 max-w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gid">Được theo dõi (followingId)</Label>
            <Input
              id="gid"
              value={followingIn}
              onChange={(e) => setFollowingIn(e.target.value)}
              className="font-mono text-sm w-72 max-w-full"
            />
          </div>
          <Button
            type="button"
            className="self-end"
            variant="secondary"
            onClick={() => {
              setFollowerId(followerIn.trim());
              setFollowingId(followingIn.trim());
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
                  <TableHead>Người theo dõi</TableHead>
                  <TableHead>Được theo dõi</TableHead>
                  <TableHead className="text-right">Xóa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={`${r.followerId}-${r.followingId}`}>
                    <TableCell className="font-mono text-xs">{r.followerId}</TableCell>
                    <TableCell className="font-mono text-xs">{r.followingId}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={busy === `${r.followerId}:${r.followingId}`}
                        onClick={() => void remove(r.followerId, r.followingId)}
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
