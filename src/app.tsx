import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import { AdminLayout } from "@/components/admin-layout";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/auth-context";
import { DashboardPage } from "@/pages/dashboard-page";
import { ForbiddenPage } from "@/pages/forbidden-page";
import { LoginPage } from "@/pages/login-page";
import { PostEditPage } from "@/pages/post-edit-page";

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
  return <Outlet />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="posts/:postId/edit" element={<PostEditPage />} />
          </Route>
        </Route>
      </Routes>
      <Toaster richColors position="top-center" />
    </>
  );
}
