import { SearchFilters, User, Vehicle } from "../types";

const TOKEN_KEY = "dealership.token";
const USER_KEY = "dealership.user";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export function storeSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(path, { ...options, headers });
  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? "Request failed");
  }
  return data as T;
}

export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    request<{ token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  listVehicles: () => request<Vehicle[]>("/api/vehicles"),
  searchVehicles: (filters: SearchFilters) => {
    const params = new URLSearchParams();
    if (filters.make) params.set("make", filters.make);
    if (filters.model) params.set("model", filters.model);
    if (filters.category) params.set("category", filters.category);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    const query = params.toString();
    return request<Vehicle[]>(`/api/vehicles/search${query ? `?${query}` : ""}`);
  },
  createVehicle: (body: Omit<Vehicle, "id">) =>
    request<Vehicle>("/api/vehicles", { method: "POST", body: JSON.stringify(body) }),
  updateVehicle: (id: number, body: Partial<Omit<Vehicle, "id">>) =>
    request<Vehicle>(`/api/vehicles/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteVehicle: (id: number) =>
    request<void>(`/api/vehicles/${id}`, { method: "DELETE" }),
  purchase: (id: number) =>
    request<Vehicle>(`/api/vehicles/${id}/purchase`, { method: "POST" }),
  restock: (id: number, quantity: number) =>
    request<Vehicle>(`/api/vehicles/${id}/restock`, {
      method: "POST",
      body: JSON.stringify({ quantity }),
    }),
};
