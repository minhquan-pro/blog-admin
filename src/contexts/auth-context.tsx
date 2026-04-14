import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { fetchAuthMe, loginApi, logoutApi } from "@/lib/api";
import type { User, UserProfile } from "@/types/domain";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false;
    void fetchAuthMe()
      .then((me) => {
        if (c) return;
        if (!me) {
          setUser(null);
          setProfile(null);
          return;
        }
        setUser(me.user);
        setProfile(me.profile);
      })
      .catch(() => {
        if (!c) {
          setUser(null);
          setProfile(null);
        }
      })
      .finally(() => {
        if (!c) setLoading(false);
      });
    return () => {
      c = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const me = await loginApi(email, password);
      if (!me.user.isAdmin) {
        await logoutApi();
        setUser(null);
        setProfile(null);
        return { ok: false as const, error: "Tài khoản không có quyền quản trị." };
      }
      setUser(me.user);
      setProfile(me.profile);
      return { ok: true as const };
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Đăng nhập thất bại — kiểm tra email và mật khẩu.";
      return { ok: false as const, error: msg };
    }
  }, []);

  const logout = useCallback(() => {
    void logoutApi().finally(() => {
      setUser(null);
      setProfile(null);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isAuthenticated: !!user,
      isAdmin: user?.isAdmin ?? false,
      loading,
      login,
      logout,
    }),
    [user, profile, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
