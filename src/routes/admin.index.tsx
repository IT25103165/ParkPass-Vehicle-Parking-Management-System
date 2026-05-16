import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { usersApi, vehiclesApi, parkingApi } from "@/lib/api";
import { Users, Car, ParkingCircle, History, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  component: () => (
    <RequireAuth role="ADMIN">
      <DashboardLayout role="ADMIN"><AdminOverview /></DashboardLayout>
    </RequireAuth>
  ),
});

function AdminOverview() {
  const { user } = useAuth();
  const users = useQuery({ queryKey: ["users"], queryFn: () => usersApi.all() });
  const vehicles = useQuery({ queryKey: ["all-vehicles"], queryFn: () => vehiclesApi.all() });
  const slots = useQuery({ queryKey: ["all-slots"], queryFn: () => parkingApi.allSlots() });
  const history = useQuery({ queryKey: ["global-history"], queryFn: () => parkingApi.globalHistory() });

  const available = slots.data?.filter((s) => s.status === "AVAILABLE").length ?? 0;
  const occupied = slots.data?.filter((s) => s.status === "OCCUPIED").length ?? 0;

  const stats = [
    { label: "Total users", value: users.data?.length ?? "—", icon: Users, href: "/admin/users" },
    { label: "Total vehicles", value: vehicles.data?.length ?? "—", icon: Car, href: "/admin/vehicles" },
    { label: "Available slots", value: `${available}/${slots.data?.length ?? "—"}`, icon: ParkingCircle, href: "/admin/slots" },
    { label: "Total records", value: history.data?.length ?? "—", icon: History, href: "/admin/records" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="pb-6 border-b border-white/5">
        <div className="text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-2 opacity-80">Dashboard</div>
        <h1 className="text-4xl font-black tracking-tight text-white mt-1">Operations Overview</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">Hi {user?.name?.split(" ")[0]} — central control for all parking infrastructure nodes.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.href} className="bg-black/40 border border-white/5 p-6 hover:bg-black/60 transition-all group">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">{s.label}</div>
                <div className="text-3xl font-black mt-2 text-white">{s.value}</div>
              </div>
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                "bg-white/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
              )}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
              Access Module <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-black/40 border border-white/5 p-8 rounded-2xl">
          <h2 className="font-black text-white text-lg tracking-tight uppercase tracking-widest mb-6">Slot Utilization</h2>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                <span className="text-muted-foreground">Occupied</span>
                <span className="text-primary">{occupied} Node(s)</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/5 shadow-inner">
                <div
                  className="h-full gradient-primary transition-all duration-1000 shadow-glow"
                  style={{ width: slots.data?.length ? `${(occupied / slots.data.length) * 100}%` : "0%" }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground mt-3 uppercase tracking-widest">
                <span>{available} free</span>
                <span>{slots.data?.length ?? 0} capacity</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-black/40 border border-white/5 p-8 rounded-2xl">
          <h2 className="font-black text-white text-lg tracking-tight uppercase tracking-widest mb-6">Recent Log Events</h2>
          <div className="space-y-3">
            {history.data?.slice(0, 5).map((r) => (
              <div key={r.id} className="flex justify-between items-center text-sm py-3 border-b border-white/5 last:border-0 group">
                <div>
                  <div className="font-black text-white group-hover:text-primary transition-colors">{r.vehiclePlateNumber} <span className="text-muted-foreground font-medium">→ {r.slotNumber}</span></div>
                  <div className="text-[10px] text-muted-foreground font-bold mt-0.5">{new Date(r.entryTime).toLocaleString()}</div>
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase px-2 py-1 rounded border",
                  r.exitTime ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-primary/10 text-primary border-primary/20"
                )}>
                  {r.exitTime ? `$${r.fee?.toFixed(2)}` : "Active"}
                </span>
              </div>
            )) ?? <div className="text-sm text-muted-foreground">No log entries found.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
