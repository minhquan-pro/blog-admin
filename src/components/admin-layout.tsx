import { Link, Outlet } from "react-router-dom";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

export function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-display text-lg font-semibold tracking-tight">
              Quản trị
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link
                to="/"
                className="text-muted-foreground hover:text-foreground"
              >
                Danh sách bài
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{user?.email}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => logout()}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
