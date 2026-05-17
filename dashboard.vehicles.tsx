import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { vehiclesApi, type VehicleDto } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Car, Trash2, Hash, Info, Edit2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/vehicles")({
  component: () => (
    <RequireAuth role="CUSTOMER">
      <DashboardLayout role="CUSTOMER"><Vehicles /></DashboardLayout>
    </RequireAuth>
  ),
});

function Vehicles() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleDto | null>(null);
  const [plate, setPlate] = useState("");
  const [type, setType] = useState("Car");
  const [brand, setBrand] = useState("");

  const openAdd = () => {
    setPlate(""); setBrand(""); setType("Car");
    setEditingVehicle(null);
    setOpen(true);
  };

  const openEdit = (v: VehicleDto) => {
    setPlate(v.plateNumber); setBrand(v.brand); setType(v.type);
    setEditingVehicle(v);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) update.mutate();
    else add.mutate();
  };

  const { data, isLoading } = useQuery({
    queryKey: ["vehicles", user!.id],
    queryFn: () => vehiclesApi.forUser(user!.id),
  });

  const add = useMutation({
    mutationFn: () => vehiclesApi.add({ plateNumber: plate, type, brand, ownerId: user!.id }),
    onSuccess: () => {
      toast.success("New vehicle added to your profile!");
      setOpen(false); setPlate(""); setBrand(""); setType("Car");
      qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: () => {
      if (!editingVehicle) throw new Error("No vehicle selected");
      return vehiclesApi.update(editingVehicle.id, { plateNumber: plate, type, brand });
    },
    onSuccess: () => {
      toast.success("Vehicle updated successfully!");
      setOpen(false); setEditingVehicle(null);
      qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: number) => vehiclesApi.remove(id),
    onSuccess: () => { toast.success("Vehicle decommissioned successfully"); qc.invalidateQueries({ queryKey: ["vehicles"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Vehicle Management</h1>
          <p className="text-muted-foreground mt-1">Register and maintain your fleet for parking access.</p>
        </div>
        <Button onClick={openAdd} variant="hero" className="shadow-glow px-6 h-11"><Plus className="h-4 w-4 mr-2" /> Register Asset</Button>
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setEditingVehicle(null); }}>
          <DialogContent className="glass-card border-white/10 p-0 overflow-hidden shadow-2xl sm:max-w-[425px]">
            <div className="h-1.5 w-full gradient-primary" />
            <div className="p-8 space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-white tracking-tight">{editingVehicle ? "Update Vehicle" : "Add New Vehicle"}</DialogTitle>
                <DialogDescription className="text-muted-foreground">{editingVehicle ? "Update your vehicle specifications." : "Enter your vehicle specifications to enable parking services."}</DialogDescription>
              </DialogHeader>
              <form className="space-y-5 pt-2" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Plate Number</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={plate} onChange={(e) => setPlate(e.target.value)} required placeholder="ABC-1234" className="pl-10 h-11 bg-white/5 border-white/10 uppercase font-black" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Manufacturer / Brand</Label>
                  <div className="relative">
                    <Info className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={brand} onChange={(e) => setBrand(e.target.value)} required placeholder="e.g. Toyota" className="pl-10 h-11 bg-white/5 border-white/10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Vehicle Classification</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10">
                      <SelectItem value="Car">Automobile (Car)</SelectItem>
                      <SelectItem value="Bike">Motorcycle (Bike)</SelectItem>
                      <SelectItem value="Van">Utility Van</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" variant="hero" className="w-full h-11 font-black shadow-glow" disabled={add.isPending || update.isPending}>
                    {add.isPending || update.isPending ? "Processing..." : (editingVehicle ? "Update Vehicle" : "Confirm Registration")}
                  </Button>
                </DialogFooter>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => <div key={i} className="glass-card p-6 h-40 animate-pulse border-white/5 bg-white/5" />)}
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((v) => (
            <div key={v.id} className="glass-card p-6 group hover:-translate-y-2 hover:shadow-glow transition-all duration-300 border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 flex gap-1">
                <button
                  onClick={() => openEdit(v)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
                ><Edit2 className="h-4 w-4" /></button>
                <button
                  onClick={() => { if (confirm("Remove this vehicle from your profile?")) del.mutate(v.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-destructive/20 text-destructive/70 hover:text-destructive"
                ><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow border border-white/20 shrink-0">
                  <Car className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-black tracking-tight text-white uppercase">{v.plateNumber}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-muted-foreground">{v.brand}</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">{v.type}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-20 text-center border-white/5 bg-white/5">
          <div className="relative inline-block">
            <Car className="h-20 w-20 mx-auto text-muted-foreground/10" />
            <Plus className="h-8 w-8 absolute bottom-0 right-0 text-primary/30" />
          </div>
          <h3 className="font-black text-xl text-white/40 mt-6 tracking-tight uppercase">No assets identified</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">Initialize your profile by registering your first vehicle asset.</p>
          <Button variant="outline" onClick={openAdd} className="mt-8 border-white/10 text-white/50 hover:text-white hover:border-white/20">Add Vehicle Now</Button>
        </div>
      )}
    </div>
  );
}
