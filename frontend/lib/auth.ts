import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = process.env.AUTH_SECRET ?? "dev-secret-123";
const SECRET = new TextEncoder().encode(secret);

const ACCESS_TTL_SECONDS = 15 * 60;     // 15 min
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 días

export type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
  createdAt?: string;
};

export async function signAccessToken(payload: Omit<JwtPayload, "iat" | "exp">) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_SECONDS}s`)
    .sign(SECRET);
}

export async function signRefreshToken(payload: Pick<JwtPayload, "sub" | "email">) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TTL_SECONDS}s`)
    .sign(SECRET);
}

export async function verifyToken<T = JwtPayload>(token: string) {
  const { payload } = await jwtVerify(token, SECRET);
  return payload as T;
}
