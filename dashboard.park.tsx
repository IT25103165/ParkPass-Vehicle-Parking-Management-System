import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { vehiclesApi, slotsApi, recordsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ParkingCircle, Car, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/park")({
  component: () => (
    <RequireAuth role="CUSTOMER">
      <DashboardLayout role="CUSTOMER">
        <ParkPage />
      </DashboardLayout>
    </RequireAuth>
  ),
});

function ParkPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [slot, setSlot] = useState<string | null>(null);

  const vehicles = useQuery({
    queryKey: ["vehicles", user?.id],
    queryFn: () => {
      if (!user?.id) {
        throw new Error("User not found");
      }

      return vehiclesApi.forUser(user.id);
    },
    enabled: !!user?.id,
  });

  const slots = useQuery({
    queryKey: ["available-slots"],
    queryFn: () => slotsApi.availableSlots(),
  });

  const park = useMutation({
    mutationFn: () => {
      if (!vehicleId || !slot) {
        throw new Error("Please select a vehicle and slot");
      }

      return recordsApi.park({
        vehicleId,
        slotNumber: slot,
      });
    },

    onSuccess: () => {
      toast.success("Vehicle parked successfully!");

      qc.invalidateQueries({ queryKey: ["vehicles", user?.id] });
      qc.invalidateQueries({ queryKey: ["history", user?.id] });
      qc.invalidateQueries({ queryKey: ["available-slots"] });

      navigate({ to: "/dashboard/history" });
    },

    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const selectedVehicle = vehicles.data?.find(
    (vehicle) => vehicle.id === vehicleId
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">
          Park a Vehicle
        </h1>

        <p className="text-muted-foreground mt-1">
          Select your vehicle and choose an available slot.
        </p>
      </div>

      <div className="glass-card p-6 border-white/10 relative overflow-hidden">
        <div
          className={cn(
            "absolute top-0 left-0 w-full h-1 transition-all",
            vehicleId ? "gradient-primary" : "bg-white/5"
          )}
        />

        <div className="flex items-center gap-3 mb-5">
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all",
              vehicleId
                ? "gradient-primary text-white shadow-glow"
                : "bg-white/10 text-muted-foreground"
            )}
          >
            {vehicleId ? <Check className="h-4 w-4" /> : "1"}
          </div>

          <div>
            <h2 className="font-black text-white tracking-tight">
              Select Vehicle
            </h2>

            {selectedVehicle && (
              <p className="text-xs text-primary font-bold">
                {selectedVehicle.plateNumber} — {selectedVehicle.brand}
              </p>
            )}
          </div>
        </div>

        {vehicles.isLoading ? (
          <div className="text-sm text-muted-foreground animate-pulse">
            Loading your vehicles...
          </div>
        ) : vehicles.data?.length ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {vehicles.data.map((vehicle) => (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => setVehicleId(vehicle.id)}
                className={cn(
                  "p-4 rounded-xl text-left transition-all border-2 flex items-center gap-3",
                  vehicleId === vehicle.id
                    ? "border-primary gradient-primary text-white shadow-glow scale-[1.02]"
                    : "border-white/10 bg-white/5 hover:border-primary/40 hover:bg-white/10"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    vehicleId === vehicle.id ? "bg-white/20" : "bg-white/5"
                  )}
                >
                  <Car className="h-5 w-5" />
                </div>

                <div>
                  <div className="font-black tracking-tight uppercase">
                    {vehicle.plateNumber}
                  </div>

                  <div
                    className={cn(
                      "text-xs mt-0.5",
                      vehicleId === vehicle.id
                        ? "text-white/80"
                        : "text-muted-foreground"
                    )}
                  >
                    {vehicle.brand} • {vehicle.type}
                  </div>
                </div>

                {vehicleId === vehicle.id && (
                  <Check className="h-4 w-4 ml-auto" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Car className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />

            <p className="text-sm text-muted-foreground">
              No vehicles registered yet.{" "}
              <a
                href="/dashboard/vehicles"
                className="text-primary font-bold hover:underline"
              >
                Add one →
              </a>
            </p>
          </div>
        )}
      </div>

      <div className="glass-card p-6 border-white/10 relative overflow-hidden">
        <div
          className={cn(
            "absolute top-0 left-0 w-full h-1 transition-all",
            slot ? "gradient-primary" : "bg-white/5"
          )}
        />

        <div className="flex items-center gap-3 mb-5">
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all",
              slot
                ? "gradient-primary text-white shadow-glow"
                : "bg-white/10 text-muted-foreground"
            )}
          >
            {slot ? <Check className="h-4 w-4" /> : "2"}
          </div>

          <div>
            <h2 className="font-black text-white tracking-tight">
              Select Slot
            </h2>

            {slot && (
              <p className="text-xs text-primary font-bold">
                Slot {slot} selected
              </p>
            )}
          </div>
        </div>

        {slots.isLoading ? (
          <div className="text-sm text-muted-foreground animate-pulse">
            Loading available slots...
          </div>
        ) : slots.data?.length ? (
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2">
            {slots.data.map((parkingSlot) => (
              <button
                key={parkingSlot.slotNumber}
                type="button"
                onClick={() => setSlot(parkingSlot.slotNumber)}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center transition-all border-2 text-xs font-bold",
                  slot === parkingSlot.slotNumber
                    ? "border-primary gradient-primary text-white shadow-glow scale-105"
                    : "border-green-500/30 bg-green-500/5 text-white/70 hover:border-green-500/60 hover:bg-green-500/10"
                )}
              >
                <ParkingCircle className="h-4 w-4 mb-1" />

                <span className="font-black text-[11px]">
                  {parkingSlot.slotNumber}
                </span>

                <span className="text-[9px] opacity-70 uppercase">
                  {parkingSlot.type}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ParkingCircle className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />

            <p className="text-sm text-muted-foreground">
              No slots available right now.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {vehicleId && slot ? (
            <span className="text-white/70">
              Fee:{" "}
              <span className="text-primary font-black">Rs. 50/hour</span>{" "}
              calculated on exit
            </span>
          ) : (
            <span>Complete both steps to park your vehicle</span>
          )}
        </div>

        <Button
          variant="hero"
          size="lg"
          className="h-12 px-8 shadow-glow font-black"
          disabled={!vehicleId || !slot || park.isPending}
          onClick={() => park.mutate()}
        >
          {park.isPending ? (
            "Processing..."
          ) : (
            <span className="flex items-center gap-2">
              Confirm Parking
              <ChevronRight className="h-5 w-5" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}