import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { vehiclesApi, parkingApi } from "@/lib/api";
import { Car, ParkingCircle, Clock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: () => (
    <RequireAuth role="CUSTOMER">
      <DashboardLayout role="CUSTOMER"><CustomerOverview /></DashboardLayout>
    </RequireAuth>
  ),
});

function CustomerOverview() {
  const { user } = useAuth();
  const vehicles = useQuery({ queryKey: ["vehicles", user!.id], queryFn: () => vehiclesApi.forUser(user!.id) });
  const history = useQuery({ queryKey: ["history", user!.id], queryFn: () => parkingApi.userHistory(user!.id) });
  const slots = useQuery({ queryKey: ["available-slots"], queryFn: () => parkingApi.availableSlots() });

  const active = history.data?.find((r) => !r.exitTime);

  const stats = [
    { label: "My vehicles", value: vehicles.data?.length ?? "—", icon: Car, href: "/dashboard/vehicles" },
    { label: "Available slots", value: slots.data?.length ?? "—", icon: ParkingCircle, href: "/dashboard/park" },
    { label: "Total trips", value: history.data?.length ?? "—", icon: Clock, href: "/dashboard/history" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold">Hello, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your parking today.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.href} className="glass-card p-6 hover:-translate-y-1 transition-transform group">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
                <div className="text-3xl font-bold mt-2">{s.value}</div>
              </div>
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <s.icon className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <div className="mt-4 text-sm text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              View <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        ))}
      </div>

      {active && (
        <div className="glass-card p-6 border-2 border-primary/40">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-primary font-semibold">Currently parked</div>
              <div className="text-2xl font-bold mt-1">{active.vehiclePlateNumber}</div>
              <div className="text-sm text-muted-foreground">Slot {active.slotNumber} • since {new Date(active.entryTime).toLocaleString()}</div>
            </div>
            <Link to="/dashboard/history" className="text-sm font-medium text-primary hover:underline">Manage →</Link>
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <h2 className="font-semibold text-lg mb-2">Quick actions</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link to="/dashboard/park" className="flex items-center gap-3 p-4 rounded-xl bg-white/40 dark:bg-white/5 hover:bg-white/70 transition-colors">
            <ParkingCircle className="h-5 w-5 text-primary" />
            <span className="font-medium">Park a vehicle</span>
          </Link>
          <Link to="/dashboard/vehicles" className="flex items-center gap-3 p-4 rounded-xl bg-white/40 dark:bg-white/5 hover:bg-white/70 transition-colors">
            <Car className="h-5 w-5 text-primary" />
            <span className="font-medium">Add new vehicle</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
