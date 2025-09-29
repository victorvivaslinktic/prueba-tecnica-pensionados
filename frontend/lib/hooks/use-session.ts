"use client";

import { useEffect, useState } from "react";
import type { User } from "@/lib/types/auth.types";

async function fetchMeWithRefresh(signal?: AbortSignal): Promise<User | null> {
  const res = await fetch("/api/users/profile", { method: "GET", cache: "no-store", signal });
  if (res.ok) return res.json();

  if (res.status === 401) {
    const r2 = await fetch("/api/users/refresh", { method: "POST", signal });
    if (r2.ok) {
      const r3 = await fetch("/api/users/profile", { method: "GET", cache: "no-store", signal });
      if (r3.ok) return r3.json();
    }
  }
  return null;
}

export function useSession(skip = false) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!skip);

  useEffect(() => {
    if (skip) return;
    let active = true;
    const ac = new AbortController();

    (async () => {
      setLoading(true);
      try {
        const me = await fetchMeWithRefresh(ac.signal);
        if (!active) return;
        setUser(me);
      } catch {
        if (!active) return;
        setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      ac.abort();
    };
  }, [skip]);

  return { user, loading };
}
