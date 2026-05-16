import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { feedbackApi } from "@/lib/api";
import { StarRating } from "@/components/StarRating";
import { Trash2, MessageSquare, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/feedback")({
  component: () => (
    <RequireAuth role="ADMIN">
      <DashboardLayout role="ADMIN"><AdminFeedback /></DashboardLayout>
    </RequireAuth>
  ),
});

function AdminFeedback() {
  const qc = useQueryClient();
  // Component 06 Read: All feedback from feedback.txt (Admin view)
  const { data, isLoading } = useQuery({ queryKey: ["feedback"], queryFn: () => feedbackApi.all() });

  // Component 06 Delete: Admin removes inappropriate feedback from feedback.txt
  const del = useMutation({
    mutationFn: (id: number) => feedbackApi.remove(id),
    onSuccess: () => { toast.success("Review removed from feedback.txt"); qc.invalidateQueries({ queryKey: ["feedback"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const avg = data?.length ? (data.reduce((s, f) => s + f.rating, 0) / data.length).toFixed(1) : "—";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Feedback Moderation</h1>
          <p className="text-muted-foreground mt-1">Review and moderate submissions from feedback.txt. Admins can delete any review.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass-card px-6 py-3 border-white/10 text-center">
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Avg Rating</div>
            <div className="text-2xl font-black text-white mt-1">⭐ {avg}</div>
          </div>
          <div className="glass-card px-6 py-3 border-white/10 text-center">
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Total Reviews</div>
            <div className="text-2xl font-black text-white mt-1">{data?.length ?? "—"}</div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map(i => <div key={i} className="glass-card p-6 h-32 animate-pulse border-white/5" />)}
        </div>
      ) : data?.length ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {data.map((f) => (
            <div key={f.id} className="glass-card p-6 border-white/10 group hover:border-white/20 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-sm font-black text-white border border-white/20 shrink-0">
                    {f.userName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-white/90">{f.userName}</div>
                    <div className="text-xs text-muted-foreground">{new Date(f.date).toLocaleString()}</div>
                  </div>
                </div>
                <StarRating value={f.rating} readOnly size={13} />
              </div>

              <p className="text-sm mt-4 text-white/70 leading-relaxed">{f.message}</p>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Admin moderation</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { if (confirm("Permanently delete this review from feedback.txt?")) del.mutate(f.id); }}
                  className="h-8 px-3 text-xs hover:bg-destructive/10 text-destructive/60 hover:text-destructive gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-20 text-center border-white/5 bg-white/5">
          <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground/10 mb-4" />
          <h3 className="font-black text-white/40 text-xl">No feedback to moderate</h3>
          <p className="text-sm text-muted-foreground mt-2">The feedback.txt file is currently empty.</p>
        </div>
      )}
    </div>
  );
}
