import { NextResponse } from "next/server";
import { z } from "zod";
import { findUserByEmail } from "@/lib/mock-db";
import { signAccessToken, signRefreshToken } from "@/lib/auth";

const isProd = process.env.NODE_ENV === "production";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials format" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  });
  const refreshToken = await signRefreshToken({ sub: user.id, email: user.email });

  const res = NextResponse.json({ ok: true }, { status: 200 });

  res.cookies.set("access_token", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 60 * 15, // 15 min
  });
  res.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });

  return res;
}
