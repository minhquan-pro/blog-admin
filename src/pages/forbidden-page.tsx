import { Link } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-16 text-center">
      <h1 className="font-display text-2xl font-semibold">Không có quyền</h1>
      <p className="text-sm text-muted-foreground">
        Tài khoản đã đăng nhập nhưng không phải quản trị viên. Hãy đăng xuất và dùng tài khoản có
        quyền, hoặc liên hệ người quản lý hệ thống.
      </p>
      <Link to="/login" className={cn(buttonVariants())}>
        Về trang đăng nhập
      </Link>
    </div>
  );
}
