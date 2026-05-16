import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Car, ParkingCircle, Clock, MessageSquare,
  Users, LayoutGrid, History, Star, LogOut, Menu, X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NavItem { to: string; label: string; icon: typeof LayoutDashboard; }

const customerNav: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/vehicles", label: "My Vehicles", icon: Car },
  { to: "/dashboard/park", label: "Park Vehicle", icon: ParkingCircle },
  { to: "/dashboard/history", label: "History", icon: Clock },
  { to: "/dashboard/feedback", label: "Feedback", icon: MessageSquare },
];

const adminNav: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/slots", label: "Manage Slots", icon: LayoutGrid },
  { to: "/admin/vehicles", label: "Vehicles", icon: Car },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/records", label: "Global Records", icon: History },
  { to: "/admin/feedback", label: "Feedback", icon: Star },
];

export function DashboardLayout({ children, role }: { children: ReactNode; role: "CUSTOMER" | "ADMIN" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const items = role === "ADMIN" ? adminNav : customerNav;

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen flex">
      {/* mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen w-72 z-40 transform transition-transform lg:translate-x-0",
          "glass border-r border-glass-border flex flex-col",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <ParkingCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">ParkPass</span>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {items.map((it) => {
            const active = path === it.to || (it.to !== "/dashboard" && it.to !== "/admin" && path.startsWith(it.to));
            return (
              <Link
                key={it.to}
                to={it.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "gradient-primary text-primary-foreground shadow-glow"
                    : "text-foreground/70 hover:bg-white/10 hover:text-foreground",
                )}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-glass-border">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
              {user?.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">{user?.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
          </div>
          <Button variant="glass" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden glass border-b border-glass-border p-4 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setOpen(true)}><Menu className="h-6 w-6" /></button>
          <span className="font-bold gradient-text">ParkPass</span>
          <div className="w-6" />
        </header>
        <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
