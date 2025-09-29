export type LoginPayload = { email: string; password: string };
export type LoginResponse = { ok: true };

export type RefreshResponse = { ok: true };

export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type ProfileGetResponse = User;
export type ProfilePutPayload = { name: string };
export type ProfilePutResponse = User;
