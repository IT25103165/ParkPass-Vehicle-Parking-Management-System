import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { parkingApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, History, Car, ParkingCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/records")({
  component: () => (
    <RequireAuth role="ADMIN">
      <DashboardLayout role="ADMIN"><Records /></DashboardLayout>
    </RequireAuth>
  ),
});

function Records() {
  // Component 04 Read: All records from parking_records.txt
  const { data, isLoading } = useQuery({ queryKey: ["global-history"], queryFn: () => parkingApi.globalHistory() });
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  // Component 04 Delete: Remove old record from parking_records.txt
  const del = useMutation({
    mutationFn: (id: number) => parkingApi.deleteRecord(id),
    onSuccess: () => { toast.success("Record purged from parking_records.txt"); qc.invalidateQueries({ queryKey: ["global-history"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const fmt = (d?: string | null) => d ? new Date(d).toLocaleString() : "—";
  const duration = (a: string, b?: string | null) => {
    if (!b) return "Active";
    const ms = new Date(b).getTime() - new Date(a).getTime();
    const m = Math.max(0, Math.round(ms / 60000));
    const h = Math.floor(m / 60); const mm = m % 60;
    return h > 0 ? `${h}h ${mm}m` : `${mm}m`;
  };

  const filtered = data?.filter(r =>
    r.vehiclePlateNumber?.toLowerCase().includes(search.toLowerCase()) ||
    r.slotNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const active = filtered?.filter(r => !r.exitTime) ?? [];
  const completed = filtered?.filter(r => r.exitTime) ?? [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between flex-wrap gap-6 pb-6 border-b border-white/5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-2 opacity-80">Financial & Logs</div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Parking Ledger
            <div className="h-2 w-2 rounded-full bg-primary shadow-glow animate-pulse" />
          </h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-md leading-relaxed">
            Comprehensive audit log from parking_records.txt. Fee calculation based on Rs. 50/hr metric.
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by plate or slot..." 
            className="pl-10 h-12 bg-black/40 border-white/5 focus:border-primary/50 transition-all rounded-xl shadow-inner" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {/* Summary stats */}
      {!isLoading && data && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Records", value: data.length, color: "text-white" },
            { label: "Active Sessions", value: active.length, color: "text-primary" },
            { label: "Total Revenue", value: `Rs. ${completed.reduce((sum, r) => sum + (r.fee ?? 0), 0).toFixed(0)}`, color: "text-green-400" },
          ].map(s => (
            <div key={s.label} className="glass-card p-5 border-white/10">
              <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{s.label}</div>
              <div className={`text-2xl font-black mt-2 ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="p-20 text-center text-sm text-muted-foreground animate-pulse">
            <div className="h-12 w-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto mb-4" />
            Synchronizing ledger records...
          </div>
        ) : filtered?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-white/5 bg-black/40">
                <tr>
                  <th className="px-8 py-5 font-black text-white/50 uppercase">Asset Node</th>
                  <th className="px-8 py-5 font-black text-white/50 uppercase">Infrastructure</th>
                  <th className="px-8 py-5 font-black text-white/50 uppercase">Entry Timestamp</th>
                  <th className="px-8 py-5 font-black text-white/50 uppercase">Exit Timestamp</th>
                  <th className="px-8 py-5 font-black text-white/50 uppercase text-right">Settlement (Rs.)</th>
                  <th className="px-8 py-5 font-black text-white/50 uppercase">Status</th>
                  <th className="px-8 py-5 text-right font-black text-white/50 uppercase">Ops</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-primary">
                          <Car className="h-4 w-4" />
                        </div>
                        <span className="font-black text-white tracking-tighter uppercase">{r.vehiclePlateNumber}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-white/70 font-bold uppercase tracking-tight">
                        <ParkingCircle className="h-3.5 w-3.5 text-primary/60" />
                        Slot {r.slotNumber}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-muted-foreground font-medium text-xs">{fmt(r.entryTime)}</td>
                    <td className="px-8 py-5 text-muted-foreground font-medium text-xs">{fmt(r.exitTime)}</td>
                    <td className="px-8 py-5 text-right">
                       <span className="font-black text-white text-base tracking-tighter">
                         {r.fee != null ? `Rs. ${r.fee.toFixed(0)}` : "—"}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                        r.exitTime ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-primary/10 text-primary border-primary/20"
                      )}>
                        {r.exitTime ? "Settled" : "Active"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 hover:bg-destructive/10 text-destructive/40 hover:text-destructive rounded-xl"
                        onClick={() => { if (confirm("Delete this parking record permanently?")) del.mutate(r.id); }}
                        disabled={!r.exitTime}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center">
            <History className="h-16 w-16 mx-auto text-muted-foreground/10 mb-4" />
            <p className="text-muted-foreground">No records found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
