import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl p-6 space-y-8">
      <section className="rounded-2xl border border-foreground/10 p-8">
        <h1 className="text-3xl font-semibold tracking-tight">Prueba Técnica – Frontend (Next.js + Mock Auth)</h1>
        <p className="mt-2 text-foreground/70">
          Este proyecto fue creado para demostrar un flujo de autenticación con <strong>Next.js (App Router)</strong>,
          cookies <strong>httpOnly</strong>, protección por <strong>middleware</strong>, y una <strong>Mock API</strong> implementada con
          <code className="mx-1 rounded bg-foreground/10 px-1 py-0.5">route handlers</code>.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href="/auth/login">
            <Button className="h-11 px-6">Ir al Login</Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cómo se creó el proyecto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="list-inside list-disc space-y-1 text-sm">
              <li>
                Scaffolding con <code className="rounded bg-foreground/10 px-1 py-0.5">create-next-app</code> (Next.js 13+ / 15, App Router).
              </li>
              <li>Gestor de paquetes: <strong>pnpm</strong>.</li>
              <li>Estilos con <strong>Tailwind CSS v4</strong> (tokens CSS en <code>globals.css</code>).</li>
              <li>Animaciones con <strong>Framer Motion</strong> (transiciones de ruta en el <code>TransitionProvider</code>).</li>
              <li>UI base propia con <strong>shadcn/ui</strong> (Button, Card, Input) + <strong>Radix</strong>.</li>
            </ul>
            <p className="text-xs text-foreground/60">
              Nota: El modo oscuro se maneja con <code>data-theme</code> en <code>&lt;html&gt;</code> (toggle en el Header).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Arquitectura y organización</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ul className="list-inside list-disc space-y-1">
              <li>
                <code>app/</code>: páginas, layouts, y <strong>route handlers</strong> para la Mock API:
                <ul className="ml-4 list-inside list-disc">
                  <li><code>/api/users/login</code>, <code>/refresh</code>, <code>/profile</code>, <code>/logout</code></li>
                </ul>
              </li>
              <li>
                <code>middleware.ts</code>: protege rutas (p. ej. <code>/admin/dashboard</code>, <code>/admin/profile</code>) verificando el <em>access token</em>.
              </li>
              <li>
                <code>lib/</code>:
                <ul className="ml-4 list-inside list-disc">
                  <li><code>server-only</code>: <code>lib/auth.ts</code>, <code>lib/cookies.ts</code>, <code>lib/mock-db.ts</code></li>
                  <li><code>services/</code>: cliente para API (<code>auth.service.ts</code>)</li>
                  <li><code>types/</code>: tipos compartidos (<code>auth.types.ts</code>)</li>
                  <li><code>utils/</code>: utilidades (<code>cn.ts</code>)</li>
                </ul>
              </li>
              <li>
                <strong>Seguridad</strong>: JWT firmados con <code>AUTH_SECRET</code> (env). Cookies <strong>httpOnly</strong> para
                access/refresh tokens.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Flujo de autenticación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ul className="list-inside list-disc space-y-1">
              <li><strong>Login</strong> (<code>/login</code>): valida con <code>POST /api/users/login</code> y setea cookies.</li>
              <li><strong>Refresh</strong>: <code>POST /api/users/refresh</code> renueva el access token usando el refresh cookie.</li>
              <li><strong>Rutas protegidas</strong>: <code>/dashboard</code> y <code>/profile</code> (middleware + verificación JWT).</li>
              <li><strong>Perfil</strong> (<code>/profile</code>): <code>GET /api/users/profile</code> y <code>PUT /api/users/profile</code> (editar nombre).</li>
            </ul>
            <p className="text-xs text-foreground/60">
              Credenciales demo: <code>demo@livecode.dev</code> / <code>secret123</code>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stack principal</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-3">
            <div>
              <p className="font-medium">Framework</p>
              <p className="text-foreground/70">Next.js (App Router)</p>
            </div>
            <div>
              <p className="font-medium">UI</p>
              <p className="text-foreground/70">Tailwind v4 + shadcn/ui</p>
            </div>
            <div>
              <p className="font-medium">Auth</p>
              <p className="text-foreground/70">JWT + cookies httpOnly</p>
            </div>
            <div>
              <p className="font-medium">Animaciones</p>
              <p className="text-foreground/70">Framer Motion</p>
            </div>
            <div>
              <p className="font-medium">Mock API</p>
              <p className="text-foreground/70">Route Handlers</p>
            </div>
            <div>
              <p className="font-medium">Gestor</p>
              <p className="text-foreground/70">pnpm</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Siguientes pasos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ul className="list-inside list-disc space-y-1">
              <li>Añadir toasts (feedback de guardado/errores).</li>
              <li>SideBar en <code>app/admin/layout.tsx</code> y navegación del panel.</li>
              <li>Validaciones con <code>zod</code> + mensajes por campo en formularios.</li>
              <li>Pruebas e2e con Playwright (login + rutas protegidas).</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
