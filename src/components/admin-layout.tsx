import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "text-sm transition-colors rounded-md px-2 py-1.5 -mx-2",
    isActive
      ? "font-medium bg-sidebar-accent text-sidebar-accent-foreground"
      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
  );

const groups: { label: string; items: { to: string; label: string }[] }[] = [
  {
    label: "Chung",
    items: [{ to: "/", label: "Tổng quan" }],
  },
  {
    label: "Nội dung",
    items: [
      { to: "/posts", label: "Bài viết" },
      { to: "/tags", label: "Tag" },
      { to: "/publications", label: "Publication" },
      { to: "/comments", label: "Bình luận" },
    ],
  },
  {
    label: "Người dùng",
    items: [{ to: "/users", label: "Người dùng" }],
  },
  {
    label: "Tương tác",
    items: [
      { to: "/post-claps", label: "Thích" },
      { to: "/bookmarks", label: "Đã lưu" },
      { to: "/user-follows", label: "Theo dõi" },
      { to: "/notifications", label: "Thông báo" },
    ],
  },
];

const sectionStyles: Record<string, { title: string; border: string }> = {
  Chung: {
    title: "text-sky-300",
    border: "border-sky-500/70",
  },
  "Nội dung": {
    title: "text-emerald-300",
    border: "border-emerald-500/70",
  },
  "Người dùng": {
    title: "text-violet-300",
    border: "border-violet-500/70",
  },
  "Tương tác": {
    title: "text-amber-300",
    border: "border-amber-500/70",
  },
};

function useAdminPageTitle(): string {
  const { pathname } = useLocation();
  if (pathname === "/" || pathname === "") return "Tổng quan";
  if (/^\/posts\/[^/]+\/edit$/.test(pathname)) return "Sửa bài";
  if (pathname.startsWith("/posts")) return "Bài viết";
  if (pathname.startsWith("/publications/") && pathname !== "/publications") {
    return "Chi tiết publication";
  }
  const map: Record<string, string> = {
    "/tags": "Tag",
    "/publications": "Publication",
    "/comments": "Bình luận",
    "/users": "Người dùng",
    "/post-claps": "Thích",
    "/bookmarks": "Đã lưu",
    "/user-follows": "Theo dõi",
    "/notifications": "Thông báo",
  };
  return map[pathname] ?? "Quản trị";
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const pageTitle = useAdminPageTitle();

  return (
    <div className="admin-shell flex min-h-screen flex-col bg-background md:flex-row">
      <aside className="flex w-full shrink-0 flex-col border-b border-sidebar-border bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:h-screen md:w-72 md:max-w-[20rem] md:shrink-0 md:overflow-y-auto md:border-b-0 md:border-r md:border-sidebar-border">
        <div className="flex flex-col gap-5 p-4 md:p-5">
          <div className="flex flex-col gap-3">
            <Link
              to="/"
              className="font-display text-lg font-semibold tracking-tight text-sidebar-foreground"
            >
              Quản trị
            </Link>
            <div className="flex flex-col gap-2 text-sm">
              <span
                className="truncate text-sidebar-foreground/70"
                title={user?.email}
              >
                {user?.email}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground sm:w-auto"
                onClick={() => logout()}
              >
                Đăng xuất
              </Button>
            </div>
          </div>

          <nav className="flex flex-col gap-6 border-t border-sidebar-border pt-5">
            {groups.map((g) => {
              const styles = sectionStyles[g.label] ?? {
                title: "text-sidebar-foreground",
                border: "border-sidebar-border",
              };
              return (
                <div
                  key={g.label}
                  className={cn("flex flex-col gap-2 border-l-2 pl-3", styles.border)}
                >
                  <span
                    className={cn(
                      "text-sm font-bold tracking-tight",
                      styles.title,
                    )}
                  >
                    {g.label}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {g.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === "/"}
                        className={navClass}
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:h-16 md:px-8">
          <h1 className="font-display text-lg font-semibold tracking-tight md:text-xl">
            {pageTitle}
          </h1>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
