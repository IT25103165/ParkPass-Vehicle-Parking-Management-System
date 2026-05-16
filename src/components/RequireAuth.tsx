import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export function RequireAuth({ children, role }: { children: ReactNode; role?: "CUSTOMER" | "ADMIN" }) {
  const { user, loaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loaded) return;
    if (!user) {
      navigate({ to: "/login" });
    } else if (role && user.role !== role) {
      navigate({ to: user.role === "ADMIN" ? "/admin" : "/dashboard" });
    }
  }, [user, loaded, role, navigate]);

  if (!loaded || !user || (role && user.role !== role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  return <>{children}</>;
}
