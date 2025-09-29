# Prueba Técnica – Parte 1  
**Frontend (Next.js + Mock Auth + Dark Mode + Rutas Protegidas)**

Este proyecto implementa un flujo de autenticación en **Next.js (App Router)** usando **JWT** con cookies **httpOnly**, una **API simulada** (mock) realizada con **route handlers** (*sin backend real*), **protección de rutas con middleware**, **modo oscuro (dark/light)** y una **UI base** construida con **Tailwind v4 + shadcn/ui**.  

---

## ✨ Características

- **Login** `/login` con validación en frontend (zod)  
- **Mock API** con handlers en `app/api/*`:
  - `POST /api/users/login` (setea cookies `access_token`/`refresh_token`)
  - `POST /api/users/refresh` (renueva `access_token`)
  - `GET /api/users/profile` (datos del usuario autenticado)
  - `PUT /api/users/profile` (edita nombre)
  - `POST /api/users/logout` (limpia cookies)
- **Rutas protegidas** (`/dashboard`, `/profile`) vía **`middleware.ts`**
- **Dark Mode** con `data-theme` en `<html>` y toggle en el **Header**
- **Animaciones** con **Framer Motion** (transiciones entre páginas)
- **UI consistente** con **shadcn/ui** (Button, Card, Input)
- **Arquitectura limpia** (servicios, tipos y store separados)
- **Store global opcional** con **Zustand** para compartir sesión en la UI

---

## 🧰 Stack

- **Framework:** Next.js (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS v4 (tokens en CSS vars)
- **UI base:** shadcn/ui (Radix + Tailwind)
- **Animaciones:** Framer Motion
- **Auth:** JWT firmado con `jose` + cookies httpOnly
- **Validación:** zod
- **Estado (UI):** Zustand (opcional, usado para reflejar el perfil en el Header)
- **Gestor de paquetes:** pnpm

---

## 📁 Estructura

```
/frontend
  ├─ app/
  │  ├─ api/
  │  │  └─ users/
  │  │     ├─ login/route.ts       # POST: login → set cookies
  │  │     ├─ refresh/route.ts     # POST: refresh access token
  │  │     ├─ me/route.ts          # GET/PUT: perfil
  │  │     └─ logout/route.ts      # POST: logout → clear cookies
  │  ├─ admin/
  │  │  └─ layout.tsx              # layout Admin
  │  ├─ auth/
  │  │  └─ layout.tsx              # layout Auth (centrado)
  │  ├─ transition-provider.tsx    # transiciones Framer Motion
  │  ├─ layout.tsx                 # root layout (Header, tema, etc.)
  │  └─ page.tsx                   # home con descripción y CTA
  │
  ├─ components/
  │  └─ general/
  │     ├─ header.tsx              # header con toggle + login/logout
  │     └─ theme-toggle.tsx        # switch dark/light
  │  └─ ui/                        # mini design system (shadcn-like)
  │     ├─ button.tsx
  │     ├─ card.tsx
  │     └─ input.tsx
  │
  ├─ lib/
  │  ├─ hooks/use-session.ts       # detecta sesión (me + refresh)
  │  ├─ services/auth.service.ts   # cliente para llamar a la mock API
  │  ├─ stores/auth.store.ts       # zustand: user compartido en UI
  │  ├─ types/auth.types.ts        # tipos compartidos
  │  ├─ utils/cn.ts                # helper cn() (clsx + tailwind-merge)
  │  ├─ auth.ts                    # firmar/verificar JWT (server-only)
  │  ├─ cookies.ts                 # helpers de cookies (server-only)
  │  └─ mock-db.ts                 # “BD” mock (persistida en globalThis)
  │
  ├─ public/
  ├─ middleware.ts                 # protege rutas /dashboard & /profile (y /admin/* si se configura)
  ├─ next.config.ts
  ├─ package.json
  └─ README.md
```

---

## 🚀 Puesta en marcha

### Requisitos
- Node.js **20+**  
- `pnpm` instalado globalmente

### Instalación
```bash
pnpm install
```

### Variables de entorno
Crea **`.env.local`** en la raíz del frontend:

```
AUTH_SECRET=dev-secret-123
```

> Evitamos `NEXT_PUBLIC_*` para secretos. El `middleware` y los handlers usan `AUTH_SECRET`.

### Ejecutar en desarrollo
```bash
pnpm dev
# http://localhost:3000
```

### Credenciales demo
- **Email:** `demo@livecode.dev`  
- **Password:** `secret123`

---

## 🔐 Flujo de Autenticación

1. **Login** (`/login`)
   - Frontend valida (zod) y llama a `POST /api/users/login`.
   - Handler firma **access** (15 min) y **refresh** (7 días) con **jose** y los setea como cookies **httpOnly**.
   - El frontend redirige a `/admin/dashboard` o al `next` query param.

2. **Protección de rutas**  
   - `middleware.ts` intercepta `/dashboard` y `/profile` (y puedes añadir `/admin/:path*`).
   - Si no hay `access_token` válido → redirige a `/login?next=...`.

3. **Refresh**
   - En cliente, el **hook `use-session`** intenta `GET /api/users/profile`.
   - Si 401, llama `POST /api/users/refresh`, y reintenta `GET /profile`.
   - Si ambos fallan, se considera **no autenticado**.

4. **Perfil** (`/profile`)
   - `GET /api/users/profile` devuelve **datos desde la “BD” mock** (no desde el token).
   - `PUT /api/users/profile` actualiza el nombre **en la “BD”** y emite un nuevo **access_token** con el nombre actualizado.

5. **Logout**
   - `POST /api/users/logout` limpia cookies httpOnly.
   - UI navega a `/login` y limpia el store.

---

## 🌓 Dark Mode

- Tokens en **CSS vars** en `globals.css`.  
- Toggle en `components/general/theme-toggle.tsx` que escribe `data-theme="dark|light"` en `<html>` y persiste en `localStorage`.  
- Evitamos “flicker” inicial con un pequeño script en el `<head>` (opcional).

Asegúrate de usar **clases basadas en tokens**: `bg-background`, `text-foreground`, `border-foreground/10`, etc.  
Clases “duras” como `bg-white`/`text-black` **no cambian** con el modo.

---

## 🧩 UI y Animaciones

- **shadcn/ui** (minimal): `Button`, `Card`, `Input` (con **CVA** + `tailwind-merge`).
- **Framer Motion**: `app/transition-provider.tsx` envuelve `children` en el `layout` para transiciones entre páginas.

---

## 🧪 Endpoints (Mock API)

| Método | Ruta                 | Descripción                                 | Auth |
|-------:|----------------------|---------------------------------------------|------|
| POST   | `/api/users/login`   | Valida credenciales, setea cookies          | No   |
| POST   | `/api/users/refresh` | Renueva `access_token` desde `refresh`      | Sí (cookie) |
| GET    | `/api/users/profile`      | Retorna id/email/name/createdAt desde “BD”  | Sí (access) |
| PUT    | `/api/users/profile`      | Actualiza `name` y emite nuevo access       | Sí (access) |
| POST   | `/api/users/logout`  | Limpia cookies                               | Sí (cookie) |

**Cookies:**  
- `access_token` (httpOnly, 15 min)  
- `refresh_token` (httpOnly, 7 días)

---

## 🧱 Middleware

`middleware.ts` está en la **raíz** del repo (mismo nivel que `package.json`).  
Protege rutas como:

```ts
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/admin/:path*"], // ajusta a tus needs
};
```

Usa el mismo `AUTH_SECRET` para verificar el JWT en Edge.

---

## 🧠 Servicios, Hooks y Store

- **Servicios** (`lib/services/auth.service.ts`): encapsulan `fetch` a `/api/*`.
- **Hook `use-session`** (`lib/hooks/use-session.ts`): intenta `/profile`, si 401 hace `/refresh` y reintenta.
- **Store (Zustand)** (`lib/stores/auth.store.ts`): comparte `user` entre páginas; al actualizar el perfil, el Header se refresca al instante con `setUser(updated)`.

---

## 🐞 Troubleshooting

**Windows + OneDrive (EPERM rename .ignored/next):**
- Mueve el repo **fuera** de `OneDrive` o **pausa** la sincronización.
- Ejecuta en PowerShell:
  ```powershell
  attrib -R /S /D node_modules 2>$null
  rmdir /s /q node_modules
  del package-lock.json 2>$null
  del yarn.lock 2>$null
  pnpm store prune
  pnpm install
  ```
- Usa **un solo** package manager (pnpm).

**No redirige después de login (aunque 200):**
- Verifica que los handlers **seteén cookies en el `NextResponse`** (no en `cookies()` a secas).
- Asegura que `middleware.ts` y handlers usan **`AUTH_SECRET`** (no `NEXT_PUBLIC_*`).

**El dark mode no cambia:**
- En `globals.css`, los selectores `html[data-theme=...]` deben ir **después** de `@media (prefers-color-scheme: dark)`.
- Usa **tokens** (`bg-background`, `text-foreground`) en la UI.

---

## 🧪 QA / Criterios de aceptación

- [ ] `/login` acepta `demo@livecode.dev / secret123` y redirige a `/admin/dashboard`.
- [ ] `/dashboard` y `/profile` **redirigen a `/login`** si no hay sesión.
- [ ] `/profile` carga datos del user, permite **editar nombre** y persiste durante la sesión.
- [ ] **Dark/Light** funciona desde el Header y se mantiene en recargas.
- [ ] La **home** (`/`) muestra descripción, stack y CTAs a Login/Dashboard/Perfil.
- [ ] No hay errores de consola en `/` (el Header no debería llamar sesión en páginas públicas).

---

## 📄 Licencia
MIT — uso educativo y de demostración.

---

## 👋 Autor
**Victor Vivas (LiveCode)** 
