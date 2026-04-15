import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import { AdminLayout } from "@/components/admin-layout";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/auth-context";
import { ForbiddenPage } from "@/pages/forbidden-page";
import { LoginPage } from "@/pages/login-page";

const DashboardPage = lazy(() =>
  import("@/pages/dashboard-page").then((m) => ({ default: m.DashboardPage })),
);
const PostsPage = lazy(() =>
  import("@/pages/posts-page").then((m) => ({ default: m.PostsPage })),
);
const PostEditPage = lazy(() =>
  import("@/pages/post-edit-page").then((m) => ({ default: m.PostEditPage })),
);
const UsersPage = lazy(() =>
  import("@/pages/users-page").then((m) => ({ default: m.UsersPage })),
);
const TagsPage = lazy(() =>
  import("@/pages/tags-page").then((m) => ({ default: m.TagsPage })),
);
const PublicationsPage = lazy(() =>
  import("@/pages/publications-page").then((m) => ({ default: m.PublicationsPage })),
);
const PublicationDetailPage = lazy(() =>
  import("@/pages/publication-detail-page").then((m) => ({
    default: m.PublicationDetailPage,
  })),
);
const CommentsPage = lazy(() =>
  import("@/pages/comments-page").then((m) => ({ default: m.CommentsPage })),
);
const PostClapsPage = lazy(() =>
  import("@/pages/post-claps-page").then((m) => ({ default: m.PostClapsPage })),
);
const BookmarksPage = lazy(() =>
  import("@/pages/bookmarks-page").then((m) => ({ default: m.BookmarksPage })),
);
const UserFollowsPage = lazy(() =>
  import("@/pages/user-follows-page").then((m) => ({ default: m.UserFollowsPage })),
);
const NotificationsPage = lazy(() =>
  import("@/pages/notifications-page").then((m) => ({ default: m.NotificationsPage })),
);

function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
      Đang tải…
    </div>
  );
}

function RequireAdmin() {
  const { loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Đang tải…
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <ForbiddenPage />;
  }
  return (
    <Suspense fallback={<PageFallback />}>
      <Outlet />
    </Suspense>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="posts" element={<PostsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="tags" element={<TagsPage />} />
            <Route path="publications" element={<PublicationsPage />} />
            <Route path="publications/:id" element={<PublicationDetailPage />} />
            <Route path="comments" element={<CommentsPage />} />
            <Route path="post-claps" element={<PostClapsPage />} />
            <Route path="bookmarks" element={<BookmarksPage />} />
            <Route path="user-follows" element={<UserFollowsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="posts/:postId/edit" element={<PostEditPage />} />
          </Route>
        </Route>
      </Routes>
      <Toaster richColors position="top-center" />
    </>
  );
}
