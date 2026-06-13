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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isApiRoute = pathname.startsWith("/api/");
  const token = req.cookies.get("token")?.value;

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const payload = await verifyJwt(token, process.env.JWT_SECRET as string);

  if (!payload) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("token");
    return res;
  }

  // Fetch fresh user status and role from the database to check if disabled or if role has changed
  let userStatus = "ACTIVE";
  let userRole = payload.role;

  try {
    const statusRes = await fetch(`${req.nextUrl.origin}/api/auth/status`, {
      headers: {
        Cookie: `token=${token}`,
      },
    });

    if (!statusRes.ok) {
      if (isApiRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("token");
      return res;
    }

    const { data } = await statusRes.json();
    userStatus = data.status;
    userRole = data.role;
  } catch (error) {
    console.error("Failed to verify user status in middleware:", error);
    if (isApiRoute) {
      return NextResponse.json({ error: "Authentication check failed" }, { status: 500 });
    }
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("token");
    return res;
  }

  if (userStatus === "DISABLED") {
    if (isApiRoute) {
      return NextResponse.json({ error: "Account disabled" }, { status: 403 });
    }
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("token");
    return res;
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (userRole !== "ADMIN") {
      if (isApiRoute) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/pos", req.url));
    }
  }

  if (isApiRoute) {
    const reqHeaders = new Headers(req.headers);
    reqHeaders.set("x-user-id", payload.userId);
    reqHeaders.set("x-user-role", userRole);
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
