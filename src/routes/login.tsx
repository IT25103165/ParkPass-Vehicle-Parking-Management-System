import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { usersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParkingCircle, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (user) {
    navigate({ to: user.role === "ADMIN" ? "/admin" : "/dashboard" });
  }

  const m = useMutation({
    mutationFn: () => usersApi.login({ email, password }),
    onSuccess: (u) => {
      login(u);
      toast.success(`Welcome back, ${u.name}!`);
      navigate({ to: u.role === "ADMIN" ? "/admin" : "/dashboard" });
    },
    onError: (e: Error) => toast.error(e.message || "Authentication failed"),
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-hero">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <Link to="/" className="flex items-center justify-center gap-3 mb-10 group">
          <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow transition-transform group-hover:scale-110 duration-300 border border-white/20">
            <ParkingCircle className="h-7 w-7 text-white" />
          </div>
          <span className="font-black text-3xl text-white tracking-tighter uppercase">ParkPass</span>
        </Link>

        <div className="glass-card p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 gradient-primary"></div>
          <h1 className="text-3xl font-black text-white tracking-tight">Access Console</h1>
          <p className="text-sm text-muted-foreground mt-2">Initialize your session to manage active parking assets.</p>

          <form
            className="mt-8 space-y-6"
            onSubmit={(e) => { e.preventDefault(); m.mutate(); }}
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Identity Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@system.com"
                  className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Access Key</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary"
                />
              </div>
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full h-12 font-black shadow-glow group" disabled={m.isPending}>
              {m.isPending ? "Authenticating..." : (
                <span className="flex items-center justify-center gap-2">
                  Initialize Session <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-muted-foreground">
              New operator? <Link to="/register" className="text-primary font-black hover:underline tracking-tight">Generate Credentials</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
