import { cookies } from "next/headers";

const isProd = process.env.NODE_ENV === "production";

export const COOKIE = {
  access: "access_token",
  refresh: "refresh_token",
};

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const jar = await cookies();
  jar.set(COOKIE.access, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 60 * 15, // 15 min
  });
  jar.set(COOKIE.refresh, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });
}

export async function clearAuthCookies() {
  const jar = await cookies();
  jar.set(COOKIE.access, "", { httpOnly: true, path: "/", maxAge: 0 });
  jar.set(COOKIE.refresh, "", { httpOnly: true, path: "/", maxAge: 0 });
}