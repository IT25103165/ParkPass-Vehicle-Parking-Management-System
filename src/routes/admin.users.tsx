import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { usersApi, type UserDto, type Role } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  User,
  Mail,
  Shield,
  Plus,
  Edit2,
  Trash2,
  Search,
  Lock,
  X,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin/users")({
  component: () => (
    <RequireAuth role="ADMIN">
      <DashboardLayout role="ADMIN">
        <AdminUsers />
      </DashboardLayout>
    </RequireAuth>
  ),
});

interface UserForm {
  name: string;
  email: string;
  role: Role;
  password: string;
}

function AdminUsers() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.all(),
  });

  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState<UserForm>({
    name: "",
    email: "",
    role: "CUSTOMER",
    password: "",
  });

  const openAdd = () => {
    setForm({
      name: "",
      email: "",
      role: "CUSTOMER",
      password: "",
    });
    setIsAdding(true);
  };

  const openEdit = (u: UserDto) => {
    setForm({
      name: u.name,
      email: u.email,
      role: u.role,
      password: "",
    });
    setEditingUser(u);
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingUser(null);
  };

  const del = useMutation({
    mutationFn: async (customerId: number) => {
      if (!user?.id) {
        throw new Error("Admin session not found");
      }

      const response = await fetch(
        `http://localhost:8080/api/users/admin/${user.id}/delete-customer/${customerId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || "Customer delete failed");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Customer account removed");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const create = useMutation({
    mutationFn: () =>
      usersApi.register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      }),
    onSuccess: () => {
      toast.success("User account created!");
      qc.invalidateQueries({ queryKey: ["users"] });
      closeModal();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: () => {
      if (!editingUser) {
        throw new Error("No user selected for editing");
      }

      return usersApi.update(editingUser.id, {
        name: form.name,
        email: form.email,
        role: form.role,
        password: form.password || undefined,
      });
    },
    onSuccess: () => {
      toast.success("User profile updated!");
      qc.invalidateQueries({ queryKey: ["users"] });
      closeModal();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = data.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (isAdding) {
      create.mutate();
    } else {
      update.mutate();
    }
  };

  const renderUserTable = (usersToRender: UserDto[], hideActions: boolean) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-white/5 bg-black/40">
          <tr>
            <th className="px-8 py-5 font-black">Identity</th>
            <th className="px-8 py-5 font-black">Access Node Email</th>
            <th className="px-8 py-5 font-black">System Role</th>
            {!hideActions && (
              <th className="px-8 py-5 text-right font-black">Operations</th>
            )}
          </tr>
        </thead>

        <tbody>
          {usersToRender.map((u) => (
            <tr
              key={u.id}
              className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-all group"
            >
              <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center text-xs font-black text-white border border-white/20 shadow-glow group-hover:scale-110 transition-transform">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-white tracking-tight">
                    {u.name}
                  </span>
                </div>
              </td>

              <td className="px-8 py-5 text-muted-foreground font-medium">
                {u.email}
              </td>

              <td className="px-8 py-5">
                <span
                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border ${u.role === "ADMIN"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-primary/10 text-primary border-primary/20"
                    }`}
                >
                  {u.role}
                </span>
              </td>

              {!hideActions && (
                <td className="px-8 py-5 text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(u)}
                    className="h-10 w-10 p-0 hover:bg-white/10 rounded-xl"
                  >
                    <Edit2 className="h-4 w-4 text-white/40 group-hover:text-white transition-colors" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete ${u.name}'s customer account?`)) {
                        del.mutate(u.id);
                      }
                    }}
                    className="h-10 w-10 p-0 hover:bg-destructive/10 text-destructive/40 hover:text-destructive rounded-xl"
                  >
                    <Trash2 className="h-4 w-4 transition-colors" />
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between flex-wrap gap-6 pb-6 border-b border-white/5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-2 opacity-80">
            System Management
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            User Registry
            <div className="h-2 w-2 rounded-full bg-primary shadow-glow animate-pulse" />
          </h1>

          <p className="text-muted-foreground mt-2 text-sm max-w-md leading-relaxed">
            Manage all system identities and access permissions directly from
            the central database ledger.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-64 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

            <Input
              placeholder="Search by name or email..."
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
            Add Account
          </Button>
        </div>
      </div>

      <div className="glass-card overflow-hidden border-white/5 bg-black/20">
        {isLoading ? (
          <div className="p-20 text-center text-sm text-muted-foreground animate-pulse">
            <div className="h-12 w-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto mb-4" />
            Synchronizing registry...
          </div>
        ) : filtered.length ? (
          <Tabs defaultValue="customers" className="w-full">
            <div className="px-8 pt-6 pb-2 border-b border-white/5">
              <TabsList className="bg-black/40 border border-white/5">
                <TabsTrigger
                  value="customers"
                  className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  Customers
                </TabsTrigger>

                <TabsTrigger
                  value="admins"
                  className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  Administrators
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="customers" className="m-0 border-none outline-none">
              {renderUserTable(
                filtered.filter((u) => u.role === "CUSTOMER"),
                false
              )}
            </TabsContent>

            <TabsContent value="admins" className="m-0 border-none outline-none">
              {renderUserTable(
                filtered.filter((u) => u.role === "ADMIN"),
                true
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="p-20 text-center">
            <User className="h-16 w-16 mx-auto text-muted-foreground/10 mb-4" />
            <p className="text-muted-foreground">No users match your search.</p>
          </div>
        )}
      </div>

      <Dialog
        open={isAdding || !!editingUser}
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
                  {isAdding ? "Create User" : "Edit User"}
                </DialogTitle>

                <DialogDescription className="text-muted-foreground">
                  {isAdding
                    ? "Register a new account in users.txt"
                    : `Editing: ${editingUser?.name}`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Full Name
                </Label>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                    placeholder="John Doe"
                    className="pl-10 h-11 bg-white/5 border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Email Address
                </Label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    required
                    placeholder="john@example.com"
                    className="pl-10 h-11 bg-white/5 border-white/10"
                  />
                </div>
              </div>

              {isAdding && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Password
                  </Label>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                    <Input
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, password: e.target.value }))
                      }
                      required
                      placeholder="••••••••"
                      className="pl-10 h-11 bg-white/5 border-white/10"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Role
                </Label>

                <Select
                  value={form.role}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, role: value as Role }))
                  }
                >
                  <SelectTrigger className="h-11 bg-white/5 border-white/10">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="CUSTOMER">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Customer
                      </div>
                    </SelectItem>

                    <SelectItem value="ADMIN">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="px-8 py-5 border-t border-white/5 bg-black/20">
              <Button
                type="button"
                variant="ghost"
                onClick={closeModal}
                className="rounded-xl"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>

              <Button
                type="submit"
                variant="hero"
                disabled={create.isPending || update.isPending}
                className="rounded-xl font-black"
              >
                {create.isPending || update.isPending
                  ? "Saving..."
                  : isAdding
                    ? "Create Account"
                    : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}