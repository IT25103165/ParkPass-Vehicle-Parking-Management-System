import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { usersApi } from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Mail, Lock, Save, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/dashboard/profile")({
  component: () => (
    <RequireAuth role="CUSTOMER">
      <DashboardLayout role="CUSTOMER"><Profile /></DashboardLayout>
    </RequireAuth>
  ),
});

function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [pass, setPass] = useState("");
  const [saved, setSaved] = useState(false);

  // Component 01: Update — calls PUT /api/users/{id} → updates users.txt
  const update = useMutation({
    mutationFn: () => usersApi.update(user!.id, {
      name: name || undefined,
      email: email || undefined,
      password: pass || undefined,
    }),
    onSuccess: (updated) => {
      updateUser({ name: updated.name, email: updated.email });
      setSaved(true);
      setPass(""); // clear password field after save
      toast.success("Profile updated successfully!");
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account identity and access credentials.</p>
      </div>

      {/* Avatar card */}
      <div className="glass-card p-8 flex items-center gap-6 border-white/10">
        <div className="h-20 w-20 rounded-2xl gradient-primary flex items-center justify-center text-4xl font-black text-white shadow-glow border border-white/20 shrink-0">
          {(name || user?.name || "?").charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="text-2xl font-black text-white tracking-tight">{user?.name}</div>
          <div className="text-sm text-muted-foreground mt-1">{user?.email}</div>
          <span className="mt-2 inline-flex px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <div className="glass-card p-8 relative overflow-hidden border-white/10">
        <div className="absolute top-0 left-0 w-full h-1 gradient-primary" />
        <h2 className="text-lg font-black text-white mb-6 tracking-tight">Update Identity</h2>

        <form onSubmit={(e) => { e.preventDefault(); update.mutate(); }} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Leave blank to keep current"
                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary"
              />
            </div>
            <p className="text-[11px] text-muted-foreground ml-1">Only fill this if you want to change your password.</p>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              variant="hero"
              className="w-full h-12 font-black shadow-glow"
              disabled={update.isPending}
            >
              {update.isPending ? (
                "Saving..."
              ) : saved ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Saved!
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Save className="h-4 w-4" /> Save Changes
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
