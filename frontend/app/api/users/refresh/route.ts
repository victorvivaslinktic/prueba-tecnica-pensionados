import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, signAccessToken } from "@/lib/auth";
import { findUserByEmail } from "@/lib/mock-db";

const isProd = process.env.NODE_ENV === "production";

export async function POST() {
  const jar = await cookies();
  const refresh = jar.get("refresh_token")?.value;
  if (!refresh) return NextResponse.json({ error: "No refresh token" }, { status: 401 });

  try {
    const payload = await verifyToken<{ sub: string; email: string }>(refresh);
    const user = findUserByEmail(payload.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const accessToken = await signAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    });

    const res = NextResponse.json({ ok: true }, { status: 200 });
    res.cookies.set("access_token", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: 60 * 15,
    });
    // NOTA: no cambiamos el refresh aquí
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }
}
