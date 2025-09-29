"use client";

import { create } from "zustand";
import type { User } from "@/lib/types/auth.types";
import { apiProfileGet } from "@/lib/services/auth.service";

type State = {
  user: User | null;
  loading: boolean;
  error: string | null;
};
type Actions = {
  load: () => Promise<void>;
  setUser: (u: User | null) => void;
  clear: () => void;
};

export const useAuthStore = create<State & Actions>((set) => ({
  user: null,
  loading: false,
  error: null,
  load: async () => {
    set({ loading: true, error: null });
    try {
      const me = await apiProfileGet();
      set({ user: me, loading: false });
    } catch (e: any) {
      set({ error: e?.message ?? "Failed", loading: false, user: null });
    }
  },
  setUser: (u) => set({ user: u }),
  clear: () => set({ user: null }),
}));
