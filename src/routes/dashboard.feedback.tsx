import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { feedbackApi, type FeedbackDto } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";
import { toast } from "sonner";
import { MessageSquare, Edit2, Trash2, Send, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard/feedback")({
  component: () => (
    <RequireAuth role="CUSTOMER">
      <DashboardLayout role="CUSTOMER"><FeedbackPage /></DashboardLayout>
    </RequireAuth>
  ),
});

function FeedbackPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");

  // Edit modal state
  const [editing, setEditing] = useState<FeedbackDto | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editMessage, setEditMessage] = useState("");

  // Component 06 Read: Load all feedback from feedback.txt
  const list = useQuery({ queryKey: ["feedback"], queryFn: () => feedbackApi.all() });

  // Component 06 Create: Submit new feedback → saves to feedback.txt
  const submit = useMutation({
    mutationFn: () => feedbackApi.submit({ userId: user!.id, message, rating }),
    onSuccess: () => {
      toast.success("Thank you for your feedback!");
      setMessage(""); setRating(5);
      qc.invalidateQueries({ queryKey: ["feedback"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Component 06 Update: Edit own review → updates feedback.txt
  const update = useMutation({
    mutationFn: () => feedbackApi.update(editing!.id, { message: editMessage, rating: editRating }),
    onSuccess: () => {
      toast.success("Feedback updated!");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["feedback"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Component 06 Delete: Remove own review from feedback.txt
  const del = useMutation({
    mutationFn: (id: number) => feedbackApi.remove(id),
    onSuccess: () => { toast.success("Feedback removed"); qc.invalidateQueries({ queryKey: ["feedback"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (f: FeedbackDto) => {
    setEditing(f);
    setEditMessage(f.message);
    setEditRating(f.rating);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">Community Reviews</h1>
        <p className="text-muted-foreground mt-1">Share your experience — stored in feedback.txt.</p>
      </div>

      {/* Component 06 Create: Submit form */}
      <form
        className="glass-card p-8 space-y-5 border-white/10 relative overflow-hidden"
        onSubmit={(e) => { e.preventDefault(); if (!message.trim()) return; submit.mutate(); }}
      >
        <div className="absolute top-0 left-0 w-full h-1 gradient-primary" />
        <h2 className="text-lg font-black text-white tracking-tight">Submit Your Review</h2>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Your Rating</label>
          <StarRating value={rating} onChange={setRating} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Your Experience</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you loved or what we can improve…"
            rows={4}
            maxLength={500}
            required
            className="bg-white/5 border-white/10 resize-none focus:border-primary"
          />
          <div className="text-[11px] text-muted-foreground text-right">{message.length}/500</div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="hero" className="h-11 px-8 shadow-glow font-black" disabled={submit.isPending || !message.trim()}>
            <Send className="h-4 w-4 mr-2" />
            {submit.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </form>

      {/* Feedback list */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-white tracking-tight">All Reviews ({list.data?.length ?? 0})</h2>
        {list.isLoading ? (
          <div className="text-sm text-muted-foreground animate-pulse">Loading reviews...</div>
        ) : list.data?.length ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {list.data.map((f) => {
              const isOwn = f.userId === user?.id;
              return (
                <div key={f.id} className={`glass-card p-6 border-white/10 transition-all ${isOwn ? "border-primary/30" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-black text-white border ${isOwn ? "gradient-primary border-white/20" : "bg-white/10 border-white/10"}`}>
                        {f.userName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white/90 flex items-center gap-2">
                          {f.userName}
                          {isOwn && <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">You</span>}
                        </div>
                        <div className="text-xs text-muted-foreground">{new Date(f.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <StarRating value={f.rating} readOnly size={13} />
                    </div>
                  </div>
                  <p className="text-sm mt-4 text-white/70 leading-relaxed">{f.message}</p>

                  {/* Own feedback controls */}
                  {isOwn && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(f)} className="h-8 px-3 text-xs hover:bg-white/10 text-white/60">
                        <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete your review?")) del.mutate(f.id); }} className="h-8 px-3 text-xs hover:bg-destructive/10 text-destructive/60 hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card p-16 text-center border-white/5 bg-white/5">
            <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground/10 mb-4" />
            <p className="text-muted-foreground font-medium">No reviews yet. Be the first!</p>
          </div>
        )}
      </div>

      {/* Component 06 Update: Edit modal */}
      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null); }}>
        <DialogContent className="glass-card border-white/10 p-0 overflow-hidden sm:max-w-md">
          <div className="h-1.5 w-full gradient-primary" />
          <form onSubmit={(e) => { e.preventDefault(); update.mutate(); }}>
            <div className="p-8 space-y-5">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-white">Edit Your Review</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rating</label>
                <StarRating value={editRating} onChange={setEditRating} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Message</label>
                <Textarea
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  rows={4}
                  maxLength={500}
                  required
                  className="bg-white/5 border-white/10 resize-none"
                />
              </div>
              <DialogFooter>
                <div className="flex gap-3 w-full">
                  <Button type="button" variant="outline" className="flex-1 border-white/10" onClick={() => setEditing(null)}>Cancel</Button>
                  <Button type="submit" variant="hero" className="flex-1 shadow-glow font-black" disabled={update.isPending}>
                    {update.isPending ? "Saving..." : "Save Review"}
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
