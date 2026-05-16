import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { usersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParkingCircle, User, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // NEW: role state
  const [role, setRole] = useState<"ADMIN" | "CUSTOMER">("CUSTOMER");

  if (user) {
    navigate({ to: user.role === "ADMIN" ? "/admin" : "/dashboard" });
  }

  const m = useMutation({
    mutationFn: () => usersApi.register({ name, email, password, role }),

    onSuccess: (u) => {
      login(u);
      toast.success(`Account commissioned. Welcome, ${u.name}!`);

      if (u.role === "ADMIN") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/dashboard" });
      }
    },

    onError: (e: Error) => toast.error(e.message || "Registration failed"),
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-hero">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <Link to="/" className="flex items-center justify-center gap-3 mb-10 group">
          <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow transition-transform group-hover:scale-110 duration-300 border border-white/20">
            <ParkingCircle className="h-7 w-7 text-white" />
          </div>
          <span className="font-black text-3xl text-white tracking-tighter uppercase">
            ParkPass
          </span>
        </Link>

        <div className="glass-card p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 gradient-primary"></div>

          <h1 className="text-3xl font-black text-white tracking-tight text-center">
            New Identity
          </h1>

          <p className="text-sm text-muted-foreground mt-2 text-center">
            Register your credentials to the global parking database.
          </p>

          <form
            className="mt-10 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              m.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Full Operator Name
              </Label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Robert Smith"
                  className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Identity Email
              </Label>

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
              <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Secure Access Key
              </Label>

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

            {/* NEW ROLE SELECTOR */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Account Type
              </Label>

              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as "ADMIN" | "CUSTOMER")}
                className="w-full h-12 rounded-md bg-white/5 border border-white/10 px-4 text-white focus:border-primary outline-none"
              >
                <option value="CUSTOMER" className="text-black">
                  Customer
                </option>
                <option value="ADMIN" className="text-black">
                  Admin
                </option>
              </select>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full h-12 font-black shadow-glow group mt-4"
              disabled={m.isPending}
            >
              {m.isPending ? "Configuring Identity..." : (
                <span className="flex items-center justify-center gap-2">
                  Commission Account
                  <ShieldCheck className="h-4 w-4 transition-transform group-hover:scale-110" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-muted-foreground">
              Already in database?{" "}
              <Link to="/login" className="text-primary font-black hover:underline tracking-tight">
                Access Console
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}