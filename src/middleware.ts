import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

const PUBLIC_PREFIXES = ["/api/auth/", "/api/kds/"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow public API prefixes
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isApiRoute = pathname.startsWith("/api/");
  const token = req.cookies.get("token")?.value;

  // 2. If no token, block
  if (!token) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const payload = await verifyToken(token);

    // 3. Block non-Admin from /admin/* routes
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      if (payload.role !== "ADMIN") {
        if (isApiRoute) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/pos", req.url));
      }
    }

    // 4. Inject headers for API routes
    if (isApiRoute) {
      const reqHeaders = new Headers(req.headers);
      reqHeaders.set("x-user-id", payload.userId);
      reqHeaders.set("x-user-role", payload.role);
      return NextResponse.next({ request: { headers: reqHeaders } });
    }

    return NextResponse.next();
  } catch {
    if (isApiRoute) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    // Redirect pages to login and clear token
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("token");
    return res;
  }
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

