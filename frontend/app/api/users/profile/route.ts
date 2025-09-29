import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE } from "@/lib/cookies";
import { verifyToken, signAccessToken } from "@/lib/auth";
import { z } from "zod";
import { findUserById, updateUserName } from "@/lib/mock-db";

async function getAccessPayload() {
  const jar = await cookies();
  const token = jar.get(COOKIE.access)?.value;
  if (!token) return null;
  try {
    return await verifyToken<{ sub: string; email: string }>(token);
  } catch {
    return null;
  }
}

export async function GET() {
  const payload = await getAccessPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = findUserById(payload.sub);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  });
}

const putSchema = z.object({ name: z.string().min(2).max(60) });

export async function PUT(req: Request) {
  const payload = await getAccessPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid name" }, { status: 400 });

  const updated = updateUserName(payload.sub, parsed.data.name);
  if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const newAccess = await signAccessToken({
    sub: updated.id,
    email: updated.email,
    name: updated.name,
    createdAt: updated.createdAt,
  });

  const res = NextResponse.json({
    id: updated.id,
    email: updated.email,
    name: updated.name,
    createdAt: updated.createdAt,
  });

  const isProd = process.env.NODE_ENV === "production";
  res.cookies.set(COOKIE.access, newAccess, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 60 * 15,
  });

  return res;
}
