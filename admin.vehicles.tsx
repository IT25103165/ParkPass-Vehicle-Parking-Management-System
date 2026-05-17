import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { vehiclesApi, usersApi, type VehicleDto } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Car,
  Trash2,
  Search,
  Plus,
  Edit2,
  Hash,
  Info,
  User as UserIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/vehicles")({
  component: () => (
    <RequireAuth role="ADMIN">
      <DashboardLayout role="ADMIN">
        <AdminVehicles />
      </DashboardLayout>
    </RequireAuth>
  ),
});

interface VehicleForm {
  plateNumber: string;
  brand: string;
  type: string;
  ownerId: string;
}

function AdminVehicles() {
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleDto | null>(null);

  const [form, setForm] = useState<VehicleForm>({
    plateNumber: "",
    brand: "",
    type: "Car",
    ownerId: "",
  });

  const { data = [], isLoading } = useQuery({
    queryKey: ["all-vehicles"],
    queryFn: () => vehiclesApi.all(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.all(),
  });

  const openAdd = () => {
    const firstCustomer = users.find((u) => u.role === "CUSTOMER");

    setForm({
      plateNumber: "",
      brand: "",
      type: "Car",
      ownerId: firstCustomer?.id?.toString() || "",
    });

    setIsAdding(true);
    setEditingVehicle(null);
  };

  const openEdit = (v: VehicleDto) => {
    setForm({
      plateNumber: v.plateNumber || "",
      brand: v.brand || "",
      type: v.type || "Car",
      ownerId: v.ownerId?.toString() || "",
    });

    setEditingVehicle(v);
    setIsAdding(false);
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingVehicle(null);
  };

  const del = useMutation({
    mutationFn: (id: number) => vehiclesApi.remove(id),
    onSuccess: () => {
      toast.success("Vehicle removed from registry");
      qc.invalidateQueries({ queryKey: ["all-vehicles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const create = useMutation({
    mutationFn: () =>
      vehiclesApi.add({
        plateNumber: form.plateNumber,
        brand: form.brand,
        type: form.type,
        ownerId: Number(form.ownerId),
      }),
    onSuccess: () => {
      toast.success("Vehicle registered!");
      qc.invalidateQueries({ queryKey: ["all-vehicles"] });
      closeModal();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async () => {
      if (!editingVehicle) {
        throw new Error("No vehicle selected");
      }

      return vehiclesApi.update(editingVehicle.id, {
        plateNumber: form.plateNumber,
        brand: form.brand,
        type: form.type,
      });
    },
    onSuccess: () => {
      toast.success("Vehicle record updated!");
      qc.invalidateQueries({ queryKey: ["all-vehicles"] });
      closeModal();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = data.filter(
    (v) =>
      v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.brand.toLowerCase().includes(search.toLowerCase()) ||
      v.type.toLowerCase().includes(search.toLowerCase()) ||
      (v.ownerName || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (isAdding) {
      create.mutate();
    } else {
      update.mutate();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between flex-wrap gap-6 pb-6 border-b border-white/5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-2 opacity-80">
            Asset Management
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Vehicle Registry
            <div className="h-2 w-2 rounded-full bg-primary shadow-glow animate-pulse" />
          </h1>

          <p className="text-muted-foreground mt-2 text-sm max-w-md leading-relaxed">
            Direct access to the vehicle authentication ledger. Manage authorized
            transport nodes.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-64 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

            <Input
              placeholder="Filter by plate, brand, type..."
              className="pl-10 h-12 bg-black/40 border-white/5 focus:border-primary/50 transition-all rounded-xl shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button
            onClick={openAdd}
            variant="hero"
            className="shadow-glow h-12 px-6 rounded-xl font-black text-sm uppercase tracking-wider"
          >
            <Plus className="h-5 w-5 mr-2" />
            Register Asset
          </Button>
        </div>
      </div>

      <div className="glass-card overflow-hidden border-white/5 bg-black/20">
        {isLoading ? (
          <div className="p-20 text-center text-sm text-muted-foreground animate-pulse">
            <div className="h-12 w-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto mb-4" />
            Retrieving vehicle assets...
          </div>
        ) : filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-white/5 bg-black/40">
                <tr>
                  <th className="px-8 py-5 font-black">Authentication Plate</th>
                  <th className="px-8 py-5 font-black">Manufacturer</th>
                  <th className="px-8 py-5 font-black">Classification</th>
                  <th className="px-8 py-5 font-black">Registered Owner</th>
                  <th className="px-8 py-5 text-right font-black">Operations</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-all group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/30 transition-all">
                          <Car className="h-5 w-5 text-primary" />
                        </div>

                        <span className="font-black text-white text-lg tracking-tighter uppercase">
                          {v.plateNumber}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-5 font-bold text-white/80">
                      {v.brand}
                    </td>

                    <td className="px-8 py-5">
                      <span className="px-3 py-1 rounded-lg bg-black/40 text-white/60 text-[9px] font-black uppercase tracking-[0.2em] border border-white/5 group-hover:border-primary/20 transition-all">
                        {v.type}
                      </span>
                    </td>

                    <td className="px-8 py-5 text-muted-foreground">
                      <div className="flex items-center gap-2 font-medium">
                        <UserIcon className="h-3.5 w-3.5 text-primary/60" />
                        {v.ownerName ?? `Node #${v.ownerId}`}
                      </div>
                    </td>

                    <td className="px-8 py-5 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(v)}
                        className="h-10 w-10 p-0 hover:bg-white/10 rounded-xl"
                      >
                        <Edit2 className="h-4 w-4 text-white/40 group-hover:text-white transition-colors" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Delete this vehicle?")) {
                            del.mutate(v.id);
                          }
                        }}
                        className="h-10 w-10 p-0 hover:bg-destructive/10 text-destructive/40 hover:text-destructive rounded-xl"
                      >
                        <Trash2 className="h-4 w-4 transition-colors" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center">
            <Car className="h-16 w-16 mx-auto text-muted-foreground/10 mb-4" />
            <p className="text-muted-foreground">
              No vehicles match your filter.
            </p>
          </div>
        )}
      </div>

      <Dialog
        open={isAdding || !!editingVehicle}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent className="glass-card border-white/10 p-0 overflow-hidden sm:max-w-md">
          <div className="h-1.5 w-full gradient-primary" />

          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-5">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-white">
                  {isAdding ? "Register Vehicle" : "Update Vehicle"}
                </DialogTitle>

                <DialogDescription className="text-muted-foreground">
                  {isAdding
                    ? "Add new entry to vehicles.txt"
                    : `Editing: ${editingVehicle?.plateNumber}`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Plate Number
                </Label>

                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                  <Input
                    value={form.plateNumber}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        plateNumber: e.target.value.toUpperCase(),
                      }))
                    }
                    required
                    placeholder="ABC-1234"
                    className="pl-10 h-11 bg-white/5 border-white/10 uppercase font-black"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Brand
                </Label>

                <div className="relative">
                  <Info className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                  <Input
                    value={form.brand}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, brand: e.target.value }))
                    }
                    required
                    placeholder="Toyota"
                    className="pl-10 h-11 bg-white/5 border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Vehicle Type
                </Label>

                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, type: value }))
                  }
                >
                  <SelectTrigger className="h-11 bg-white/5 border-white/10">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>

                  <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10">
                    <SelectItem value="Car">Car</SelectItem>
                    <SelectItem value="Bike">Bike</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isAdding && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Assign Owner
                  </Label>

                  <Select
                    value={form.ownerId}
                    onValueChange={(value) =>
                      setForm((f) => ({ ...f, ownerId: value }))
                    }
                  >
                    <SelectTrigger className="h-11 bg-white/5 border-white/10">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Select owner" />
                      </div>
                    </SelectTrigger>

                    <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10">
                      {users
                        .filter((u) => u.role === "CUSTOMER")
                        .map((u) => (
                          <SelectItem key={u.id} value={u.id.toString()}>
                            {u.name} ({u.email})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <DialogFooter className="pt-4">
                <div className="flex gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11 border-white/10"
                    onClick={closeModal}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="hero"
                    className="flex-1 h-11 shadow-glow font-black"
                    disabled={create.isPending || update.isPending}
                  >
                    {create.isPending || update.isPending
                      ? "Saving..."
                      : isAdding
                        ? "Register"
                        : "Update"}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}