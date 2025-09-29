"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiProfileGet, apiProfilePut } from "@/lib/services/auth.service"; // ← IMPORT NUEVO
import { useAuthStore } from "@/lib/stores/auth.store";

type Profile = { id: string; email: string; name: string; createdAt: string };

export default function MePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuthStore();

  async function load() {
    setError(null);
    try {
      const data = await apiProfileGet();                  
      setProfile(data);
      setName(data.name);
      setUser(data);
    } catch {
      setError("Unauthorized. Please login again.");
    }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const updated = await apiProfilePut({ name });
      setProfile(updated);
      setUser(updated);
    } catch (e: any) {
      setError(e?.message ?? "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-semibold">Perfil</h1>
        {error ? <p className="text-red-500 mt-2">{error}</p> : <p className="text-foreground/70 mt-2">Cargando…</p>}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><span className="text-foreground/70">Email:</span> {profile.email}</p>
          <p><span className="text-foreground/70">Creado:</span> {new Date(profile.createdAt).toLocaleString()}</p>

          <div className="space-y-1">
            <label className="text-sm text-foreground/70">Nombre</label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button onClick={save} disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
