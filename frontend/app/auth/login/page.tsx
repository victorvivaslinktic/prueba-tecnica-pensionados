"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiLogin } from "@/lib/services/auth.service";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/admin/dashboard";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const data = { email: String(form.get("email") || ""), password: String(form.get("password") || "") };
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      setError("Please provide a valid email and a password (min 6 chars).");
      return;
    }

    setLoading(true);
    await apiLogin(parsed.data);
    setLoading(false);
    router.replace(next);
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm">Email</label>
              <Input name="email" type="email" placeholder="demo@livecode.dev" defaultValue="demo@livecode.dev" />
            </div>
            <div className="space-y-1">
              <label className="text-sm">Password</label>
              <Input name="password" type="password" placeholder="secret123" defaultValue="secret123" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="text-xs text-foreground/70 mt-3">
            Use <code>demo@livecode.dev</code> / <code>secret123</code>.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
