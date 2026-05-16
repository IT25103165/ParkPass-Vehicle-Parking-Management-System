import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { UserDto } from "./api";

interface AuthCtx {
  user: UserDto | null;
  login: (u: UserDto) => void;
  logout: () => void;
  updateUser: (u: Partial<UserDto>) => void;
  loaded: boolean;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "parking_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  const login = (u: UserDto) => {
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  };

  const updateUser = (u: Partial<UserDto>) => {
    const updated = { ...user!, ...u };
    localStorage.setItem(KEY, JSON.stringify(updated));
    setUser(updated);
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, login, logout, updateUser, loaded }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}
