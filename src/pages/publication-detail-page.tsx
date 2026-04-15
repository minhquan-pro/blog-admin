import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import {
  addAdminPublicationMember,
  fetchAdminPublication,
  fetchAdminPublicationMembers,
  removeAdminPublicationMember,
  updateAdminPublication,
} from "@/lib/api";
import type { AdminPublicationMemberRow, Publication, PublicationRole } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const roles: PublicationRole[] = ["owner", "editor", "writer"];

export function PublicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [pub, setPub] = useState<Publication | null>(null);
  const [members, setMembers] = useState<AdminPublicationMemberRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [savingPub, setSavingPub] = useState(false);

  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState<PublicationRole>("writer");
  const [busyMember, setBusyMember] = useState<string | null>(null);

  function loadAll() {
    if (!id) return Promise.resolve();
    return Promise.all([
      fetchAdminPublication(id).then((p) => {
        setPub(p);
        setEditName(p.name);
        setEditDesc(p.description);
      }),
      fetchAdminPublicationMembers(id).then(setMembers),
    ]);
  }

  useEffect(() => {
    if (!id) return;
    let c = false;
    void loadAll().catch((e: unknown) => {
      if (!c) {
        const msg = e instanceof Error ? e.message : "Không tải được";
        setLoadError(msg);
        toast.error(msg);
      }
    });
    return () => {
      c = true;
    };
  }, [id]);

  async function savePublication(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSavingPub(true);
    try {
      const p = await updateAdminPublication(id, {
        name: editName,
        description: editDesc,
      });
      setPub(p);
      toast.success("Đã lưu publication");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setSavingPub(false);
    }
  }

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !newUserId.trim()) return;
    setBusyMember("add");
    try {
      await addAdminPublicationMember(id, {
        userId: newUserId.trim(),
        role: newRole,
      });
      toast.success("Đã thêm thành viên");
      setNewUserId("");
      await loadAll();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setBusyMember(null);
    }
  }

  async function removeMember(userId: string) {
    if (!id || !confirm("Xóa thành viên này?")) return;
    setBusyMember(userId);
    try {
      await removeAdminPublicationMember(id, userId);
      toast.success("Đã xóa");
      await loadAll();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setBusyMember(null);
    }
  }

  if (!id) {
    return <p className="text-muted-foreground">Thiếu id.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link
          to="/publications"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
        >
          ← Danh sách
        </Link>
      </div>

      {loadError && (
        <p className="text-destructive" role="alert">
          {loadError}
        </p>
      )}

      {pub && (
        <Card>
          <CardHeader>
            <CardTitle>{pub.name}</CardTitle>
            <CardDescription className="font-mono">{pub.slug}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={savePublication} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pname">Tên</Label>
                <Input
                  id="pname"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdesc">Mô tả</Label>
                <Textarea
                  id="pdesc"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={4}
                />
              </div>
              <Button type="submit" disabled={savingPub}>
                Lưu
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Thành viên</CardTitle>
          <CardDescription>Thêm theo UUID người dùng.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={addMember} className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="uid">User ID</Label>
              <Input
                id="uid"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                className="font-mono text-sm w-[min(100%,28rem)]"
                placeholder="uuid"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
              <select
                id="role"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as PublicationRole)}
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={busyMember === "add"}>
              Thêm
            </Button>
          </form>

          {!members && <p className="text-sm text-muted-foreground">Đang tải…</p>}
          {members && members.length === 0 && (
            <p className="text-sm text-muted-foreground">Chưa có thành viên.</p>
          )}
          {members && members.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.userId}>
                    <TableCell>
                      <div className="font-mono text-xs">{m.userId}</div>
                      {m.profile && (
                        <div className="text-sm">
                          @{m.profile.username} — {m.profile.displayName}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{m.role}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={busyMember === m.userId}
                        onClick={() => void removeMember(m.userId)}
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
