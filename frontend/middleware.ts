import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.NEXT_PUBLIC_AUTH_SECRET ?? "dev-secret-123");

const PROTECTED = ["/admin/dashboard", "/admin/profile"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Sólo proteger rutas listadas
  if (!PROTECTED.some(p => pathname.startsWith(p))) return NextResponse.next();

  const access = req.cookies.get("access_token")?.value;
  if (!access) {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  try {
    await jwtVerify(access, SECRET);
    return NextResponse.next();
  } catch {
    // intenta refresh vía API (side-step: redirige a login)
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/admin/profile/:path*"],
};
