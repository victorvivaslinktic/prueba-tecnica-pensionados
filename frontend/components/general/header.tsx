"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { apiLogout } from "@/lib/services/auth.service";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";

function getInitials(name?: string, email?: string) {
  if (name && name.trim().length > 0) {
    const [a, b] = name.trim().split(/\s+/, 2);
    return ((a?.[0] ?? "") + (b?.[0] ?? "")).toUpperCase() || "U";
  }
  return email?.[0]?.toUpperCase() || "U";
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = pathname === "/" || pathname === "/auth/login";

  const { user, loading, load, clear } = useAuthStore();

  useEffect(() => {
    if (!isPublic && !user) load();
  }, [isPublic]);

  async function logout() {
    await apiLogout();
    clear(); 
    router.push("/auth/login");
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-foreground/10">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold">MyApp</Link>

        <nav className="flex items-center gap-3">
          {loading ? null : user ? (
            <div className="flex items-center gap-2">
              <div
                aria-label="Usuario autenticado"
                className="grid h-8 w-8 place-items-center rounded-full bg-foreground/10 text-xs font-semibold"
                title={user.name || user.email}
              >
                {getInitials(user.name, user.email)}
              </div>
              <div className="hidden sm:flex flex-col leading-tight mr-1">
                <span className="text-sm">{user.name ?? "Usuario"}</span>
                <span className="text-xs text-foreground/70">{user.email}</span>
              </div>
              <Link className="hover:opacity-80" href="/admin/dashboard">Dashboard</Link>
              <Link className="hover:opacity-80" href="/admin/profile">Perfil</Link>
              <ThemeToggle />
              <Button size="sm" variant="outline" onClick={logout}>Logout</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/auth/login">
                <Button size="sm">Login</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
