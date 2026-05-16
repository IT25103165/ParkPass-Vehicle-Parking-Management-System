import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ClipboardList, Trash2 } from "lucide-react";
import { recordsApi, type ParkingRecordDto } from "@/lib/api";

export const Route = createFileRoute("/admin/records")({
  component: () => (
    <RequireAuth role="ADMIN">
      <DashboardLayout role="ADMIN">
        <AdminRecords />
      </DashboardLayout>
    </RequireAuth>
  ),
});



function fmt(date?: string | null) {
  return date ? new Date(date).toLocaleString() : "Active";
}

function AdminRecords() {
  const qc = useQueryClient();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["records"],
    queryFn: async () => {
      const response = await recordsApi.globalHistory();
      return response;
    },
  });

  const deleteRecord = useMutation({
    mutationFn: async (id: number) => {
      return recordsApi.deleteRecord(id);
    },

    onSuccess: () => {
      toast.success("Record deleted successfully");
      qc.invalidateQueries({ queryKey: ["records"] });
    },

    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-2">
          Parking Records
        </div>

        <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
          Parking Records
          <ClipboardList className="h-8 w-8 text-primary" />
        </h1>

        <p className="text-muted-foreground mt-2">
          View and manage all parking history records.
        </p>
      </div>

      <div className="glass-card p-6">
        {isLoading ? (
          <p className="text-muted-foreground">Loading records...</p>
        ) : records.length ? (
          <div className="space-y-3">
            {records.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div>
                  <p className="font-bold text-white">
                    {record.vehiclePlateNumber} — Slot {record.slotNumber}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Entry: {fmt(record.entryTime)}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Exit: {fmt(record.exitTime)}
                  </p>

                  <p className="text-sm text-primary font-bold">
                    Fee: {record.fee != null ? `Rs. ${record.fee}` : "Pending"}
                  </p>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleteRecord.isPending}
                  onClick={() => {
                    if (confirm("Delete this parking record?")) {
                      deleteRecord.mutate(record.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No parking records found.</p>
        )}
      </div>
    </div>
  );
}
