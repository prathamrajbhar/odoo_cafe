import { NextRequest, NextResponse } from "next/server";
import { deleteRefreshToken } from "@/lib/db/refreshTokens";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (refreshToken) {
    await deleteRefreshToken(refreshToken).catch(() => null);
  }

  const res = NextResponse.json({ data: { success: true } });
  res.cookies.set("access_token", "", { httpOnly: true, path: "/", maxAge: 0 });
  res.cookies.set("refresh_token", "", { httpOnly: true, path: "/", maxAge: 0 });
  // Clear legacy cookie if present
  res.cookies.set("token", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
