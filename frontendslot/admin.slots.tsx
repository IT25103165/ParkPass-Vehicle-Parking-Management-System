import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ParkingCircle, Trash2 } from "lucide-react";
import { slotsApi, type ParkingSlotDto } from "@/lib/api";

export const Route = createFileRoute("/admin/slots")({
  component: () => (
    <RequireAuth role="ADMIN">
      <DashboardLayout role="ADMIN">
        <AdminSlots />
      </DashboardLayout>
    </RequireAuth>
  ),
});



function AdminSlots() {
  const qc = useQueryClient();

  const [slotNumber, setSlotNumber] = useState("");
  const [type, setType] = useState("Car");

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["slots"],
    queryFn: async () => {
      const response = await slotsApi.allSlots();
      return response;
    },
  });

  const addSlot = useMutation({
    mutationFn: async () => {
      return slotsApi.addSlot({ slotNumber, type });
    },

    onSuccess: () => {
      toast.success("Slot added successfully");
      setSlotNumber("");
      setType("Car");
      qc.invalidateQueries({ queryKey: ["slots"] });
    },

    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({
      slotNumber,
      status,
    }: {
      slotNumber: string;
      status: string;
    }) => {
      return slotsApi.updateStatus(slotNumber, status);
    },

    onSuccess: () => {
      toast.success("Slot status updated");
      qc.invalidateQueries({ queryKey: ["slots"] });
    },

    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const deleteSlot = useMutation({
    mutationFn: async (slotNumber: string) => {
      return slotsApi.deleteSlot(slotNumber);
    },

    onSuccess: () => {
      toast.success("Slot deleted successfully");
      qc.invalidateQueries({ queryKey: ["slots"] });
    },

    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!slotNumber.trim()) {
      toast.error("Slot number is required");
      return;
    }

    addSlot.mutate();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-2">
          Parking Slot Management
        </div>

        <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
          Parking Slots
          <ParkingCircle className="h-8 w-8 text-primary" />
        </h1>

        <p className="text-muted-foreground mt-2">
          Add, view, update, and delete parking slots.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
        <h2 className="text-xl font-black text-white">
          Add New Slot
        </h2>

        <Input
          value={slotNumber}
          onChange={(e) => setSlotNumber(e.target.value.toUpperCase())}
          placeholder="Slot Number e.g. A01"
          required
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full h-11 rounded-md bg-black/40 border border-white/10 px-3 text-white"
        >
          <option value="Car">Car</option>
          <option value="Bike">Bike</option>
          <option value="Van">Van</option>
        </select>

        <Button type="submit" disabled={addSlot.isPending}>
          {addSlot.isPending ? "Adding..." : "Add Slot"}
        </Button>
      </form>

      <div className="glass-card p-6">
        <h2 className="text-xl font-black text-white mb-4">
          All Slots
        </h2>

        {isLoading ? (
          <p className="text-muted-foreground">Loading slots...</p>
        ) : slots.length ? (
          <div className="space-y-3">
            {slots.map((slot) => (
              <div
                key={slot.slotNumber}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div>
                  <p className="font-bold text-white">{slot.slotNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {slot.type} — {slot.status}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={updateStatus.isPending}
                    onClick={() =>
                      updateStatus.mutate({
                        slotNumber: slot.slotNumber,
                        status:
                          slot.status === "AVAILABLE"
                            ? "OCCUPIED"
                            : "AVAILABLE",
                      })
                    }
                  >
                    Toggle Status
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleteSlot.isPending}
                    onClick={() => {
                      if (confirm(`Delete slot ${slot.slotNumber}?`)) {
                        deleteSlot.mutate(slot.slotNumber);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No slots found.</p>
        )}
      </div>
    </div>
  );
}
