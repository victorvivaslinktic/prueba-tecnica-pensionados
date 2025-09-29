import { LoginPayload, LoginResponse, ProfileGetResponse, ProfilePutPayload, ProfilePutResponse, RefreshResponse } from "@/lib/types/auth.types";

const json = (init?: RequestInit) => ({
  ...init,
  headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
});

export async function apiLogin(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch("/api/users/login", json({ method: "POST", body: JSON.stringify(payload) }));
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Login failed");
  return res.json();
}

export async function apiRefresh(): Promise<RefreshResponse> {
  const res = await fetch("/api/users/refresh", { method: "POST" });
  if (!res.ok) throw new Error("Refresh failed");
  return res.json();
}

export async function apiLogout(): Promise<void> {
  const res = await fetch("/api/users/logout", { method: "POST" });
  if (!res.ok) throw new Error("Logout failed");
}

export async function apiProfileGet(): Promise<ProfileGetResponse> {
  const res = await fetch("/api/users/profile", { method: "GET", cache: "no-store" });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export async function apiProfilePut(payload: ProfilePutPayload): Promise<ProfilePutResponse> {
  const res = await fetch("/api/users/profile", json({ method: "PUT", body: JSON.stringify(payload) }));
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Update failed");
  return res.json();
}
