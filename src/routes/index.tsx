import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ParkingCircle, ShieldCheck, Sparkles, Zap, Car, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user } = useAuth();
  const dashHref = user?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <div className="min-h-screen">
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <ParkingCircle className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-white uppercase">ParkPass</span>
        </div>
        <nav className="flex items-center gap-2">
          {user ? (
            <Button asChild variant="hero"><Link to={dashHref}>Open dashboard</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost"><Link to="/login">Sign in</Link></Button>
              <Button asChild variant="hero"><Link to="/register">Get started</Link></Button>
            </>
          )}
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs font-medium mb-6">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Smart parking, beautifully simple
        </div>
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] text-white">
          PARK SMARTER.<br />
          <span className="gradient-text uppercase">MANAGE FAST.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          A modern parking management platform for customers and operators. Track vehicles, reserve slots, and bill in seconds — all from a single, elegant dashboard.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
          <Button asChild variant="hero" size="xl">
            <Link to={user ? dashHref : "/register"}>{user ? "Go to dashboard" : "Create account"}</Link>
          </Button>
          {!user && (
            <Button asChild variant="glass" size="xl"><Link to="/login">I have an account</Link></Button>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { icon: Car, title: "Vehicle registry", desc: "Add and manage all your vehicles in one secure place." },
          { icon: ParkingCircle, title: "Live slot map", desc: "See which slots are open in real time and grab one instantly." },
          { icon: Zap, title: "Instant checkout", desc: "Exit and pay with one tap — automatic fee calculation." },
          { icon: ShieldCheck, title: "Role-based access", desc: "Tailored experiences for customers and admins." },
          { icon: BarChart3, title: "Operator analytics", desc: "Admins get insights across users, vehicles, and slots." },
          { icon: Sparkles, title: "Beautiful by design", desc: "Glassmorphic UI with smooth motion and clean typography." },
        ].map((f) => (
          <div key={f.title} className="bg-black/40 border border-white/5 p-8 rounded-2xl hover:bg-black/60 transition-all group">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow mb-6 group-hover:scale-110 transition-transform">
              <f.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="font-black text-xl text-white uppercase tracking-tight">{f.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
