import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PREFIXES = ["/api/auth/", "/api/kds/"];

function b64urlDecode(str: string): Uint8Array<ArrayBuffer> {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function verifyJwt(token: string, secret: string): Promise<{ userId: string; role: string } | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const keyData = new TextEncoder().encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const signingInput = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const signature = b64urlDecode(parts[2]);

  const valid = await crypto.subtle.verify("HMAC", cryptoKey, signature, signingInput);
  if (!valid) return null;

  const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(parts[1])));
  if (payload.exp && Date.now() / 1000 > payload.exp) return null;

  return { userId: payload.userId, role: payload.role };
}

function clearAuthAndRedirect(req: NextRequest, isApiRoute: boolean) {
  if (isApiRoute) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const res = NextResponse.redirect(new URL("/login", req.url));
  res.cookies.delete("access_token");
  res.cookies.delete("refresh_token");
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isApiRoute = pathname.startsWith("/api/");
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  let payload = accessToken
    ? await verifyJwt(accessToken, process.env.JWT_SECRET as string)
    : null;

  // Access token missing or expired — try refresh
  if (!payload) {
    if (!refreshToken) return clearAuthAndRedirect(req, isApiRoute);

    const refreshRes = await fetch(`${req.nextUrl.origin}/api/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refresh_token=${refreshToken}` },
    });

    if (!refreshRes.ok) return clearAuthAndRedirect(req, isApiRoute);

    // Extract the new access token from the refresh response cookie
    const setCookieHeader = refreshRes.headers.get("set-cookie") ?? "";
    const newAccessMatch = setCookieHeader.match(/access_token=([^;]+)/);
    const newRefreshMatch = setCookieHeader.match(/refresh_token=([^;]+)/);

    if (!newAccessMatch) return clearAuthAndRedirect(req, isApiRoute);

    const newAccessToken = newAccessMatch[1];
    payload = await verifyJwt(newAccessToken, process.env.JWT_SECRET as string);
    if (!payload) return clearAuthAndRedirect(req, isApiRoute);

    // Forward with new tokens set
    const reqHeaders = new Headers(req.headers);
    reqHeaders.set("x-user-id", payload.userId);
    reqHeaders.set("x-user-role", payload.role);
    const response = isApiRoute
      ? NextResponse.next({ request: { headers: reqHeaders } })
      : NextResponse.next();
    response.cookies.set("access_token", newAccessToken, { httpOnly: true, path: "/", maxAge: 60 * 15 });
    if (newRefreshMatch) {
      response.cookies.set("refresh_token", newRefreshMatch[1], { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
    }
    return response;
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (payload.role !== "ADMIN") {
      if (isApiRoute) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return NextResponse.redirect(new URL("/pos", req.url));
    }
  }

  if (isApiRoute) {
    const reqHeaders = new Headers(req.headers);
    reqHeaders.set("x-user-id", payload.userId);
    reqHeaders.set("x-user-role", payload.role);
    return NextResponse.next({ request: { headers: reqHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin",
    "/admin/:path*",
    "/pos",
    "/pos/:path*",
  ],
};
