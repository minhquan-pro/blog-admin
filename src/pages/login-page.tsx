import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useAuth } from "@/contexts/auth-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginPage() {
  const { t } = useTranslation();
  const { login, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!loading && isAdmin) {
      navigate("/", { replace: true });
    }
  }, [loading, isAdmin, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      const result = await login(email, password);
      if (result.ok) {
        toast.success(t("login.success"));
        navigate("/", { replace: true });
      } else {
        toast.error(result.error ?? t("login.error"));
      }
    } finally {
      setPending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        {t("login.loading")}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-6 flex justify-end">
        <LanguageSwitcher />
      </div>
      <h1 className="font-display text-3xl font-semibold">{t("login.title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("login.subtitle")}</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("login.email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("login.password")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t("login.submitting") : t("login.submit")}
        </Button>
      </form>
    </div>
  );
}
