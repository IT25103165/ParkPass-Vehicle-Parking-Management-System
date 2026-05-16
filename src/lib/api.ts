const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8080/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      msg = data.message || data.error || msg;
    } catch {
      try { msg = (await res.text()) || msg; } catch { /* ignore */ }
    }
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export const api = {
  get: <T>(p: string) => request<T>(p),
  post: <T>(p: string, body?: unknown) => request<T>(p, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(p: string, body?: unknown) => request<T>(p, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  del: <T>(p: string) => request<T>(p, { method: "DELETE" }),
};

export type Role = "CUSTOMER" | "ADMIN";

export interface UserDto { id: number; name: string; email: string; role: Role; password?: string; }
export interface VehicleDto { id: number; plateNumber: string; type: string; brand: string; ownerId: number; ownerName?: string; }
export interface ParkingSlotDto { slotNumber: string; type: string; status: "AVAILABLE" | "OCCUPIED"; }
export interface ParkingRecordDto {
  id: number; vehicleId: number; vehiclePlateNumber: string;
  slotNumber: string; entryTime: string; exitTime?: string | null; fee?: number | null;
}
export interface FeedbackDto { id: number; userId: number; userName: string; message: string; rating: number; date: string; }

// ─── Component 01: User Management ────────────────────────────────────────────
export const usersApi = {
  /** Create: Register new user → saves to users.txt */
  register: (b: { name: string; email: string; password: string; role: Role }) => api.post<UserDto>("/users/register", b),
  /** Read: Login → reads from users.txt */
  login: (b: { email: string; password: string }) => api.post<UserDto>("/users/login", b),
  /** Read: Get all users (Admin only) */
  all: () => api.get<UserDto[]>("/users"),
  /** Read: Get single user */
  get: (id: number) => api.get<UserDto>(`/users/${id}`),
  /** Update: Edit user name/email/password/role → updates users.txt */
  update: (id: number, b: { name?: string; email?: string; role?: string; password?: string }) => api.put<UserDto>(`/users/${id}`, b),
  /** Delete: Remove user account → deletes from users.txt */
  remove: (id: number) => api.del<{ message: string }>(`/users/${id}`),
};

// ─── Component 02: Vehicle Management ─────────────────────────────────────────
export const vehiclesApi = {
  /** Create: Add vehicle → saves to vehicles.txt */
  add: (b: { plateNumber: string; type: string; brand: string; ownerId: number }) => api.post<VehicleDto>("/vehicles", b),
  /** Read: Get vehicles by owner */
  forUser: (id: number) => api.get<VehicleDto[]>(`/vehicles/user/${id}`),
  /** Read: Get all vehicles (Admin) */
  all: () => api.get<VehicleDto[]>("/vehicles"),
  /** Update: Edit vehicle info → updates vehicles.txt */
  update: (id: number, b: { plateNumber?: string; brand?: string; type?: string }) => api.put<VehicleDto>(`/vehicles/${id}`, b),
  /** Delete: Remove vehicle → deletes from vehicles.txt */
  remove: (id: number) => api.del<{ message: string }>(`/vehicles/${id}`),
};

// ─── Component 03 & 04: Parking Slot & Record Management ──────────────────────
export const parkingApi = {
  /** Create: Add slot → saves to parking_slots.txt */
  addSlot: (b: { slotNumber: string; type: string }) => api.post<ParkingSlotDto>("/parking/slots", b),
  /** Read: All slots */
  allSlots: () => api.get<ParkingSlotDto[]>("/parking/slots"),
  /** Read: Available slots only */
  availableSlots: () => api.get<ParkingSlotDto[]>("/parking/slots/available"),
  /** Delete: Remove slot → deletes from parking_slots.txt */
  deleteSlot: (n: string) => api.del<unknown>(`/parking/slots/${n}`),
  /** Create: Park vehicle → saves to parking_records.txt */
  park: (b: { vehicleId: number; slotNumber: string }) => api.post<ParkingRecordDto>("/parking/park", b),
  /** Update: Exit vehicle → updates parking_records.txt with exit time + fee */
  exit: (vehicleId: number) => api.post<ParkingRecordDto>(`/parking/exit/${vehicleId}`),
  /** Read: User parking history */
  userHistory: (uid: number) => api.get<ParkingRecordDto[]>(`/parking/history/user/${uid}`),
  /** Read: All parking records (Admin) */
  globalHistory: () => api.get<ParkingRecordDto[]>("/parking/history"),
  /** Delete: Remove old record → deletes from parking_records.txt */
  deleteRecord: (id: number) => api.del<{ message: string }>(`/parking/records/${id}`),
};

// ─── Component 06: Feedback Management ────────────────────────────────────────
export const feedbackApi = {
  /** Create: Submit feedback → saves to feedback.txt */
  submit: (b: { userId: number; message: string; rating: number }) => api.post<FeedbackDto>("/feedback", b),
  /** Read: All feedback */
  all: () => api.get<FeedbackDto[]>("/feedback"),
  /** Update: Edit own feedback → updates feedback.txt */
  update: (id: number, b: { message: string; rating: number }) => api.put<FeedbackDto>(`/feedback/${id}`, b),
  /** Delete: Remove feedback (user or admin) → deletes from feedback.txt */
  remove: (id: number) => api.del<unknown>(`/feedback/${id}`),
};
