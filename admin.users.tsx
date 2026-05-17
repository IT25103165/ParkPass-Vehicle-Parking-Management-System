import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shield, User, Trash2, Edit2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersRoute,
});

function AdminUsersRoute() {
  return (
    <RequireAuth role="ADMIN">
      <DashboardLayout role="ADMIN">
        <AdminUsers />
      </DashboardLayout>
    </RequireAuth>
  );
}

type UserDto = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
};

type AdminDashboardResponse = {
  totalAdmins: number;
  totalCustomers: number;
  totalVehicles: number;
  totalSlots: number;
  totalRecords: number;
  totalFeedback: number;
  admins: UserDto[];
  customers: UserDto[];
  allUsers: UserDto[];
};

type AdminForm = {
  name: string;
  email: string;
  password: string;
  adminCode: string;
};

async function readError(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return data?.error || fallback;
  } catch {
    return fallback;
  }
}

function AdminUsers() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<UserDto | null>(null);

  const [form, setForm] = useState<AdminForm>({
    name: "",
    email: "",
    password: "",
    adminCode: "",
  });

  const { data, isLoading, isError, error } = useQuery<
    AdminDashboardResponse,
    Error
  >({
    queryKey: ["admin-dashboard", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error("Admin not found");
      }

      const response = await fetch(
        `http://localhost:8080/api/admin/${user.id}/dashboard`
      );

      if (!response.ok) {
        throw new Error(await readError(response, "Failed to load admin data"));
      }

      return response.json();
    },
    enabled: !!user?.id,
  });

  const createAdmin = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("Admin not found");
      }

      const response = await fetch(
        `http://localhost:8080/api/admin/${user.id}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error(await readError(response, "Failed to create admin"));
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Admin account created");
      resetForm();
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateAdmin = useMutation({
    mutationFn: async () => {
      if (!user?.id || !editingAdmin) {
        throw new Error("Admin not selected");
      }

      const response = await fetch(
        `http://localhost:8080/api/admin/${user.id}/admins/${editingAdmin.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await readError(response, "Failed to update admin"));
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Admin updated");
      resetForm();
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteAdmin = useMutation({
    mutationFn: async (targetAdminId: number) => {
      if (!user?.id) {
        throw new Error("Admin not found");
      }

      const response = await fetch(
        `http://localhost:8080/api/admin/${user.id}/admins/${targetAdminId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(await readError(response, "Failed to delete admin"));
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Admin deleted");
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteCustomer = useMutation({
    mutationFn: async (customerId: number) => {
      if (!user?.id) {
        throw new Error("Admin not found");
      }

      const response = await fetch(
        `http://localhost:8080/api/admin/${user.id}/customers/${customerId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(await readError(response, "Failed to delete customer"));
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Customer deleted");
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => {
    setShowAdminForm(false);
    setEditingAdmin(null);
    setForm({
      name: "",
      email: "",
      password: "",
      adminCode: "",
    });
  };

  const openCreate = () => {
    setEditingAdmin(null);
    setForm({
      name: "",
      email: "",
      password: "",
      adminCode: "",
    });
    setShowAdminForm(true);
  };

  const openEdit = (admin: UserDto) => {
    setEditingAdmin(admin);
    setForm({
      name: admin.name,
      email: admin.email,
      password: "",
      adminCode: "",
    });
    setShowAdminForm(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (editingAdmin) {
      updateAdmin.mutate();
    } else {
      createAdmin.mutate();
    }
  };

  if (isLoading) {
    return <div className="p-8 text-white">Loading admin management...</div>;
  }

  if (isError) {
    return <div className="p-8 text-red-400">{error.message}</div>;
  }

  const admins = data?.admins ?? [];
  const customers = data?.customers ?? [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-2">
            Admin Management
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Admin Control Center
            <Shield className="h-8 w-8 text-primary" />
          </h1>

          <p className="text-muted-foreground mt-2">
            Manage admins, customers, and system overview.
          </p>
        </div>

        <Button onClick={openCreate} variant="hero">
          <Plus className="h-4 w-4 mr-2" />
          Register Admin
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Admins" value={data?.totalAdmins ?? 0} />
        <StatCard label="Customers" value={data?.totalCustomers ?? 0} />
        <StatCard label="Vehicles" value={data?.totalVehicles ?? 0} />
        <StatCard label="Slots" value={data?.totalSlots ?? 0} />
        <StatCard label="Records" value={data?.totalRecords ?? 0} />
        <StatCard label="Feedback" value={data?.totalFeedback ?? 0} />
      </div>

      {showAdminForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <h2 className="text-2xl font-black text-white">
            {editingAdmin ? "Edit Admin" : "Register New Admin"}
          </h2>

          <Input
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({ ...f, name: e.target.value }))
            }
            placeholder="Admin name"
            required
          />

          <Input
            value={form.email}
            type="email"
            onChange={(e) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
            placeholder="Admin email"
            required
          />

          <Input
            value={form.password}
            type="password"
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            placeholder={
              editingAdmin ? "New password optional" : "Admin password"
            }
            required={!editingAdmin}
          />

          {!editingAdmin && (
            <Input
              value={form.adminCode}
              onChange={(e) =>
                setForm((f) => ({ ...f, adminCode: e.target.value }))
              }
              placeholder="Admin code"
              required
            />
          )}

          <div className="flex gap-3">
            <Button type="submit" variant="hero">
              {editingAdmin ? "Update Admin" : "Create Admin"}
            </Button>

            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="glass-card p-6">
        <h2 className="text-2xl font-black text-white mb-4">
          Administrators
        </h2>

        <div className="space-y-3">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />

                <div>
                  <p className="font-bold text-white">{admin.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {admin.email}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(admin)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (confirm(`Delete admin ${admin.name}?`)) {
                      deleteAdmin.mutate(admin.id);
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
      </div>

      <div className="glass-card p-6">
        <h2 className="text-2xl font-black text-white mb-4">
          Customers
        </h2>

        <div className="space-y-3">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />

                <div>
                  <p className="font-bold text-white">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {customer.email}
                  </p>
                </div>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm(`Delete customer ${customer.name}?`)) {
                    deleteCustomer.mutate(customer.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="text-3xl font-black text-white mt-2">{value}</p>
    </div>
  );
}