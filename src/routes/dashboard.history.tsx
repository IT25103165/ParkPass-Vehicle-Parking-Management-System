import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { parkingApi, type ParkingRecordDto } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, Car, ParkingCircle, Receipt, History, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/history")({
  component: () => (
    <RequireAuth role="CUSTOMER">
      <DashboardLayout role="CUSTOMER"><HistoryPage /></DashboardLayout>
    </RequireAuth>
  ),
});

function fmt(d?: string | null) { return d ? new Date(d).toLocaleString() : "—"; }
function duration(a: string, b?: string | null) {
  if (!b) return "—";
  const ms = new Date(b).getTime() - new Date(a).getTime();
  const m = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(m / 60); const mm = m % 60;
  return h > 0 ? `${h}h ${mm}m` : `${mm}m`;
}

function HistoryPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [receipt, setReceipt] = useState<ParkingRecordDto | null>(null);

  // Component 04 Read: Get user's parking history from parking_records.txt
  const { data, isLoading } = useQuery({
    queryKey: ["history", user!.id],
    queryFn: () => parkingApi.userHistory(user!.id),
  });

  // Component 04 Update: Exit vehicle → updates parking_records.txt with exit time + fee (Rs. 50/hr)
  const exit = useMutation({
    mutationFn: (vehicleId: number) => parkingApi.exit(vehicleId),
    onSuccess: (rec) => {
      setReceipt(rec);
      qc.invalidateQueries();
      toast.success("Checkout complete!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const active = data?.filter((r) => !r.exitTime) ?? [];
  const past = data?.filter((r) => r.exitTime) ?? [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">Parking History</h1>
        <p className="text-muted-foreground mt-1">Your records from parking_records.txt — fee = hours × Rs. 50.</p>
      </div>

      {/* Active sessions */}
      {isLoading ? (
        <div className="glass-card p-8 border-white/5 animate-pulse" />
      ) : active.length > 0 ? (
        <div className="space-y-3">
          <h2 className="font-black text-white text-lg flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> Active Session
          </h2>
          {active.map((r) => (
            <div key={r.id} className="glass-card p-6 border-2 border-primary/40 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 gradient-primary" />
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow border border-white/20">
                    <Car className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white uppercase tracking-tight">{r.vehiclePlateNumber}</div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><ParkingCircle className="h-3.5 w-3.5" /> Slot {r.slotNumber}</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Since {fmt(r.entryTime)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="hero"
                  className="h-11 px-6 shadow-glow font-black"
                  disabled={exit.isPending}
                  onClick={() => exit.mutate(r.vehicleId)}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {exit.isPending ? "Processing..." : "Exit & Pay"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Completed records */}
      <div className="space-y-3">
        <h2 className="font-black text-white text-lg flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" /> Completed Sessions ({past.length})
        </h2>
        <div className="glass-card overflow-hidden border-white/10">
          {isLoading ? (
            <div className="p-8 text-sm text-muted-foreground animate-pulse">Loading history...</div>
          ) : past.length === 0 ? (
            <div className="p-16 text-center">
              <History className="h-16 w-16 mx-auto text-muted-foreground/10 mb-4" />
              <p className="text-muted-foreground">No completed sessions yet. Park your vehicle to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase tracking-wider text-muted-foreground border-b border-glass-border bg-white/5">
                  <tr>
                    <th className="px-5 py-4">Vehicle</th>
                    <th className="px-5 py-4">Slot</th>
                    <th className="px-5 py-4">Entry</th>
                    <th className="px-5 py-4">Exit</th>
                    <th className="px-5 py-4">Duration</th>
                    <th className="px-5 py-4 text-right">Fee</th>
                    <th className="px-5 py-4" />
                  </tr>
                </thead>
                <tbody>
                  {past.map((r) => (
                    <tr key={r.id} className="border-b border-glass-border/30 last:border-0 hover:bg-white/5 transition-all">
                      <td className="px-5 py-4 font-black text-primary uppercase tracking-tight">{r.vehiclePlateNumber}</td>
                      <td className="px-5 py-4 text-white/70">{r.slotNumber}</td>
                      <td className="px-5 py-4 text-muted-foreground text-xs">{fmt(r.entryTime)}</td>
                      <td className="px-5 py-4 text-muted-foreground text-xs">{fmt(r.exitTime)}</td>
                      <td className="px-5 py-4 font-medium">{duration(r.entryTime, r.exitTime)}</td>
                      <td className="px-5 py-4 text-right font-black gradient-text text-base">Rs. {r.fee?.toFixed(0) ?? "—"}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setReceipt(r)}
                          className="text-xs text-primary/70 hover:text-primary font-bold hover:underline"
                        >
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Receipt dialog */}
      <Dialog open={!!receipt} onOpenChange={(o) => !o && setReceipt(null)}>
        <DialogContent className="glass-card border-white/10 p-0 overflow-hidden sm:max-w-sm">
          <div className="h-1.5 w-full gradient-primary" />
          <div className="p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-black text-white">
                <Receipt className="h-5 w-5 text-primary" /> Parking Receipt
              </DialogTitle>
            </DialogHeader>
            {receipt && (
              <>
                <div className="text-center py-6 rounded-2xl gradient-primary text-white shadow-glow border border-white/20">
                  <div className="text-[11px] font-black uppercase tracking-widest opacity-80">Total Due</div>
                  <div className="text-5xl font-black mt-2">Rs. {receipt.fee?.toFixed(0) ?? "0"}</div>
                  <div className="text-xs opacity-70 mt-2">@ Rs. 50/hour</div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Vehicle", value: receipt.vehiclePlateNumber },
                    { label: "Slot", value: receipt.slotNumber },
                    { label: "Entry Time", value: fmt(receipt.entryTime) },
                    { label: "Exit Time", value: fmt(receipt.exitTime) },
                    { label: "Duration", value: duration(receipt.entryTime, receipt.exitTime) },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                      <span className="text-sm text-muted-foreground font-medium">{row.label}</span>
                      <span className="text-sm text-white font-bold">{row.value}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full h-11 font-black" variant="hero" onClick={() => setReceipt(null)}>
                  Done
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
