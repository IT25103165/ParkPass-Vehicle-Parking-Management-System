import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { parkingApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ParkingCircle, Trash2, Hash, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/slots")({
  component: () => (
    <RequireAuth role="ADMIN">
      <DashboardLayout role="ADMIN"><Slots /></DashboardLayout>
    </RequireAuth>
  ),
});

function Slots() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [num, setNum] = useState("");
  const [type, setType] = useState("Car");

  const { data, isLoading } = useQuery({ queryKey: ["all-slots"], queryFn: () => parkingApi.allSlots() });

  const add = useMutation({
    mutationFn: () => parkingApi.addSlot({ slotNumber: num, type }),
    onSuccess: () => { toast.success("Slot added to infrastructure"); setOpen(false); setNum(""); qc.invalidateQueries(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (n: string) => parkingApi.deleteSlot(n),
    onSuccess: () => { toast.success("Infrastructure slot decommissioned"); qc.invalidateQueries(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between flex-wrap gap-6 pb-6 border-b border-white/5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-2 opacity-80">Infrastructure</div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Slot Architecture
            <div className="h-2 w-2 rounded-full bg-primary shadow-glow animate-pulse" />
          </h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-md leading-relaxed">
            Configure and monitor the physical parking coordinates and classification matrices.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="hero" className="shadow-glow h-11 px-6 font-black"><Plus className="h-4 w-4 mr-2" /> Add Infrastructure</Button></DialogTrigger>
          <DialogContent className="glass-card border-white/10 p-0 overflow-hidden shadow-2xl sm:max-w-[425px]">
            <div className="h-1.5 w-full gradient-primary" />
            <div className="p-8 space-y-6">
               <DialogHeader>
                 <DialogTitle className="text-2xl font-black text-white tracking-tight">Expand Capacity</DialogTitle>
                 <DialogDescription className="text-muted-foreground">Define new parking coordinates and classification types.</DialogDescription>
               </DialogHeader>
               <form className="space-y-5 pt-2" onSubmit={(e) => { e.preventDefault(); add.mutate(); }}>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Coordinate ID</Label>
                   <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input value={num} onChange={(e) => setNum(e.target.value)} required placeholder="e.g. A01" className="pl-10 h-11 bg-white/5 border-white/10 font-black" />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Asset Classification</Label>
                   <Select value={type} onValueChange={setType}>
                     <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white font-bold">
                        <div className="flex items-center gap-2">
                           <Layers className="h-4 w-4 text-muted-foreground" />
                           <SelectValue />
                        </div>
                     </SelectTrigger>
                     <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10">
                       <SelectItem value="Car">Automobile (Car)</SelectItem>
                       <SelectItem value="Bike">Motorcycle (Bike)</SelectItem>
                       <SelectItem value="Van">Utility Van</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <DialogFooter className="pt-4">
                   <Button type="submit" variant="hero" className="w-full h-11 font-black shadow-glow" disabled={add.isPending}>
                      {add.isPending ? "Configuring..." : "Confirm Deployment"}
                   </Button>
                 </DialogFooter>
               </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-4">
        <span className="flex items-center gap-2 text-success/80"><span className="h-2 w-2 rounded-full bg-success shadow-[0_0_10px_oklch(var(--success))]" /> Operational / Free</span>
        <span className="flex items-center gap-2 text-destructive/80"><span className="h-2 w-2 rounded-full bg-destructive shadow-[0_0_10px_oklch(var(--destructive))]" /> Engaged / Occupied</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
           {[...Array(12)].map((_, i) => <div key={i} className="aspect-square glass-card animate-pulse border-white/5 bg-white/5" />)}
        </div>
      ) : data?.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {data.map((s) => {
            const occupied = s.status === "OCCUPIED";
            return (
              <div
                key={s.slotNumber}
                className={cn(
                  "relative aspect-square rounded-2xl flex flex-col items-center justify-center text-center group transition-all duration-300 border-2 overflow-hidden",
                  occupied
                    ? "bg-destructive/10 border-destructive/20 text-destructive/90 shadow-sm"
                    : "bg-black/40 border-white/5 hover:border-primary/40 hover:bg-black/60 hover:-translate-y-1",
                )}
              >
                <div className={cn("mb-2 p-2 rounded-xl", occupied ? "bg-destructive/10" : "bg-white/5")}>
                   <ParkingCircle className={cn("h-6 w-6", occupied ? "text-destructive" : "text-primary")} />
                </div>
                <div className="font-black text-lg tracking-tighter text-white">{s.slotNumber}</div>
                <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mt-0.5">{s.type}</div>
                
                {!occupied && (
                   <button
                     onClick={() => { if (confirm(`Decommission coordinate ${s.slotNumber}?`)) del.mutate(s.slotNumber); }}
                     className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive hover:text-white"
                   ><Trash2 className="h-3.5 w-3.5" /></button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-20 text-center border-white/5 bg-white/5">
          <ParkingCircle className="h-16 w-16 mx-auto text-muted-foreground/10" />
          <h3 className="font-black text-xl text-white/40 mt-6 tracking-tight uppercase">No Infrastructure</h3>
          <p className="text-sm text-muted-foreground mt-2">Initialize the system by adding parking coordinates.</p>
        </div>
      )}
    </div>
  );
}
